#!/usr/bin/env node

'use strict';

const globby = require('globby');
const chokidar = require('chokidar');
const spawn = require('cross-spawn');
const path = require('path');
const argsv = require('minimist')(process.argv.slice(2));

/**
 * Execute the mocha command.
 *
 * @ignore
 * @param {String[]} files - The files to execute test for.
 * @param {Object} args - The arguments provided from the command line.
 * @param {String} [args.r] - A module that will be executed before the tests are run.
 * @param {Boolean} [forceMocha] - When set to true it will force the use of mocha instead of istanbul.
 * @return {ChildProcess} The child process that does the testing.
 */
function mocha(files, args, forceMocha) {
  if (!files.length) {
    return null;
  }
  const input = files.map(file => file);

  // require module option
  if (args.r) {
    input.push('-r');
    input.push(args.r);
  }
  // report format
  if (args.f === 'file') {
    input.push('-R');
    input.push('mocha-junit-reporter');
    input.push('-O');
    input.push('mochaFile=' + (args.o ? path.join(args.o, 'tests/results.xml') : './testResults/tests/results.xml'));
  }

  let command = 'mocha';

  // code coverage
  if (args.c && !forceMocha) {
    command = 'istanbul';
    input.unshift('--');
    input.unshift('node_modules/mocha/bin/_mocha');
    input.unshift(args.o ? path.join(args.o, 'coverage/') : './testResults/coverage/');
    input.unshift('--dir');
    input.unshift('--include-all-sources');
    if (args.f === 'file') {
      input.unshift('html');
      input.unshift('--report');
      input.unshift('none');
      input.unshift('--print');
    } else {
      input.unshift('none');
      input.unshift('--report');
      input.unshift('both');
      input.unshift('--print');
    }

    const codePatterns = Array.isArray(args.c) ? args.c : [args.c];
    codePatterns.forEach(codePattern => {
      if (codePattern[0] === '!') {
        input.unshift(codePattern.slice(1));
        input.unshift('-x');
      } else {
        input.unshift(codePattern);
        input.unshift('-i');
      }
    });

    input.unshift('cover');
  }

  // execute
  return spawn(command, input, { stdio: 'inherit' });
}

/**
 * Check the coverage thresholds.
 *
 * @ignore
 * @param {Object} args - The arguments passed into the command line.
 * @return {Child_Process} The child process that runs the command to check coverage or null if no check is specified.
 */
function checkCoverage(args) {
  if (!args.c || (args.branches && args.functions && args.lines && args.statements)) {
    return null;
  }

  const input = ['check-coverage'];
  if (args.branches) {
    input.push('--branches');
    input.push(args.branches);
  }
  if (args.functions) {
    input.push('--functions');
    input.push(args.functions);
  }
  if (args.lines) {
    input.push('--lines');
    input.push(args.lines);
  }
  if (args.statements) {
    input.push('--statements');
    input.push(args.statements);
  }
  return spawn('istanbul', input, { stdio: 'inherit' });
}

/**
 * Watch for changes to the given files and execute mocha when they do change.
 *
 * @ignore
 * @param {Object} [args] - The arguments provided from the command line.
 * @return {void}
 */
function mochaWatch(args) {
  if (args.w) {
    const watcher = chokidar.watch(args._, {
      ignored: /[\/\\]\./,
      persistent: true
    });
    watcher.on('ready', () => {
      watcher.on('add', files => { mocha([files], args, true); });
      watcher.on('change', files => { mocha([files], args, true); });
    });
  }
}

if (!argsv._.length) {
  //
  // print help info if args are missing
  //
  console.log('Usage: build-test <files> [<files>] [-c <files>]');
  console.log('                  [-o <out directory>] [-w] [-f <format>] [-r <module>]');
  console.log('                  [--branches <number>] [--functions <number>] [--lines <number>] [--statements <number>]');
  console.log('');
  console.log('Options:');
  console.log('<files>\t A glob pattern that identifies files that contain unit tests.  Multiple glob patterns can be specified.');
  console.log('-c\t A glob pattern that identifies files to produce code coverage metrics for. Multiple glob patterns can be specified.');
  console.log('-f\t The format for the output.  Options are [console, file]');
  console.log('-o\t The directory to send output to.  This defaults to testResults/.');
  console.log('-r\t A modue to require before any tests are run.');
  console.log('-w\t When present the files specified in the -g glob pattern(s) will be watched for changes and tested when they do change.');
  console.log('--branches\t Global branch coverage threshold when code coverage is performed.');
  console.log('--functions\t Global function coverage threshold when code coverage is performed.');
  console.log('--lines\t\t Global line coverage threshold when code coverage is performed.');
  console.log('--statements\t Global statement coverage threshold when code coverage is performed.');
  process.exitCode = 1;
} else if (argsv.w) {
  //
  // watch for changes to files
  //
  mochaWatch(argsv);
} else {
  //
  // test files specified
  //
  globby(argsv._).then(files => {
    if (files.length) {
      mocha(files, argsv)
        .on('exit', code => {
          const check = (code === 0) ? checkCoverage(argsv) : null;
          if (check) {
            check.on('exit', checkCode => {
              process.exitCode = checkCode;
            });
          } else {
            process.exitCode = code;
          }
        });
    }
  });
}
