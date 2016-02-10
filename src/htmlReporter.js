'use strict';

const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const util = require('mocha/lib/utils');
const ms = require('mocha/lib/ms');
const Spec = require('mocha/lib/reporters/spec');

/**
 * Initialize a new `Doc` reporter.
 *
 * @param {Runner} runner - The test runner.
 * @param {Stream} options - The stream to write output to.
 * @returns {void}
 */
function doc(runner, options) {
  new Spec(runner); // eslint-disable-line no-new

  const stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 };
  const outputFile = options.reporterOptions;
  mkdirp.sync(path.dirname(outputFile));
  const stream = fs.createWriteStream(outputFile);
  let indents = 2;

  function indent() {
    return Array(indents).join('  ');
  }

  runner.on('start', function () {
    stats.start = new Date();
    stream.write('<html><head><style>\n');
    stream.write('body { font-family: Helvetica Neue, Helvetica, Arial;font-size: 14px;color:#333; }\n');
    stream.write('dl { padding-left:25px; }\n');
    stream.write('.quiet { color:rgba(0,0,0,0.5); }\n');
    stream.write('.pass { color:green; }\n');
    stream.write('.fail { color:red; }\n');
    stream.write('</style></head><body>\n');
    stream.write('<h2>Unit Tests: <span id="unit-tests-header"></span></h2>\n');
    stream.write('<div id="summary"></div>\n');
  });

  runner.on('test end', function () {
    stats.tests++;
  });

  runner.on('suite', function (suite) {
    stats.suits++;
    if (suite.root) {
      return;
    }
    ++indents;
    stream.write(indent() + '<section class="suite">\n');
    ++indents;
    stream.write(indent() + '<h3>' + util.escape(suite.title) + '</h3>\n');
    stream.write(indent() + '<dl>\n');
  });

  runner.on('suite end', function (suite) {
    if (suite.root) {
      return;
    }
    stream.write(indent() + '</dl>\n');
    --indents;
    stream.write(indent() + '</section>\n');
    --indents;
  });

  runner.on('pass', function (test) {
    stats.passes++;
    stream.write(indent() + '  <dt><span class="pass">&#10004; </span><span class="quiet">' + util.escape(test.title) + '</span></dt>\n');
  });

  runner.on('fail', function (test, err) {
    stats.failures++;
    stream.write(indent() + '  <dt><span class="fail">&#10006 </span>' + util.escape(test.title) + '</dt>\n');
    stream.write(indent() + '  <dd class="fail">' + util.escape(err) + '</dd>\n');
  });

  runner.on('pending', function () {
    stats.pending++;
  });

  runner.on('end', function () {
    stats.end = new Date();
    stats.duration = stats.end - stats.start;

    stream.write('<script>\n');
    if (stats.failures > 0) {
      stream.write('document.getElementById("unit-tests-header").innerHTML = "FAILED";');
      stream.write('document.getElementById("unit-tests-header").className = "fail";');
    } else {
      stream.write('document.getElementById("unit-tests-header").innerHTML = "PASSED";');
      stream.write('document.getElementById("unit-tests-header").className = "pass";');
    }
    let summary = '<div>Started: ' + stats.start.toLocaleString() + '</div>';
    summary += '<div class=\\"pass\\">' + stats.passes + ' passing (' + ms(stats.duration) + ')</div>';
    if (stats.failures > 0) {
      summary += '<div class=\\"fail\\">' + stats.failures + ' failing</div>';
    }
    if (stats.pending > 0) {
      summary += '<div>' + stats.pending + ' pending</div>';
    }
    stream.write('document.getElementById("summary").innerHTML = \'' + summary + '\';\n');
    stream.write('</script>\n');

    stream.write('</body>\n</html>\n');
    stream.end();
  });
}

/**
 * Expose `doc`.
 */
exports = module.exports = doc;
