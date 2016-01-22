/*
 * Tasks and functions related to unit testing code.
 *
 * @author Nate Wallace
 */
'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const del = require('del');

/**
 * Function that registers testing and code coverage tasks.
 *
 * @param {object} opts - The options for the tasks.
 * @param {string|string[]} opts.testGlob - Globs that identify unit tests.
 * @param {string|string[]} opts.codeGlob - Globs that identify code for code coverage.
 * @param {object} opts.thresholds - Thresholds passed to the code coverage tasks.
 * @param {string} opts.outputDir - The directory that unit tests and code coverage tasks can output to.
 * @param {string | string[]} [opts.require] - Optional list of modules to require before running tests.
 * @param {string} [opts.tasksPrefix] - Optional prefix to apply to task names.
 * @param {string[]} [opts.tasksDependencies] - Optional array of tasks names that must be completed before these registered tasks runs.
 * @returns {function} - Function that registers tasks.
 */
module.exports = function (opts) {
  const input = {
    testGlob: opts.testGlob,
    codeGlob: opts.codeGlob,
    thresholds: opts.thresholds,
    outputDir: opts.outputDir,
    tasksDependencies: opts.tasksDependencies || []
  };

  if (opts.tasksPrefix) {
    input.tasksPrefix = opts.tasksPrefix + '-';
  } else {
    input.tasksPrefix = '';
  }

  if (opts.require) {
    input.require = Array.isArray(opts.require) ? opts.require : [opts.require];
  } else {
    input.require = [];
  }

  /*
   * Run unit tests without code coverage.
   */
  gulp.task(input.tasksPrefix + 'test-without-coverage', input.tasksDependencies, function () {
    return gulp.src(input.testGlob, { read: false })
      .pipe(mocha({ require: input.require }));
  });

  /*
   * Setup for test coverage.
   */
  gulp.task(input.tasksPrefix + 'pre-test-coverage', input.tasksDependencies, function () {
    del.sync(input.outputDir);

    return gulp.src(input.codeGlob)
      .pipe(istanbul({
        includeUntested: true
      }))
      .pipe(istanbul.hookRequire());
  });

  /*
   * Run unit tests with code coverage.
   */
  gulp.task(input.tasksPrefix + 'test-with-coverage', ['pre-test-coverage'], function () {
    return gulp.src(input.testGlob)
      .pipe(mocha({ require: input.require }))
      .pipe(istanbul.writeReports({ dir: input.outputDir }))
      .pipe(istanbul.enforceThresholds({ thresholds: input.thresholds }));
  });
};
