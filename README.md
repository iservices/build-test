# build-test

This package is currently in **BETA**

## Overview
This is a node package that defines gulp tasks that can be used to perform testing and code coverage.
It uses the [mocha](https://www.npmjs.com/package/mocha) and [istanbul](https://www.npmjs.com/package/istanbul) packages for unit testing and code coverage respectively.

## Guide

To start you will need to install this package for your project by executing the following command within your project from the console.

```
npm install --save-dev build-test
``` 

Once the package is installed you will need to create a `gulpfile.js` file within the root folder of your project if there isn't one already.
Within this file you will register the gulp tasks that are defined within this package using the `registerTasks` function.  The following is an example
of this.

```
'use strict';

const test = require('build-test');

test.registerTasks({
  testGlob: ['/src/tests/**/*.js'],
  codeGlob: ['/src/**/*.js', '!/src/tests/**/*.js'],
  thresholds: { 
    global: 80,
    each: 60
  },
  outputDir: './testResults'
});
```

Once you have registered the test tasks you can execute a test run using gulp.  To run the test task 
you simply need to execute the following console command from within your project.

```
gulp test-with-coverage
```

In addition to executing tasks from the console you can also chain the gulp testing tasks together with other gulp tasks to utilize the testing functionality however it's needed.

## API

### build-test.registerTasks(options)

The registerTasks function will register 2 tasks with gulp which are named as follows:

- 'test-with-coverage' - This task will execute unit tests as well as collect code coverage reports.  Unit test and code coverage results are output to the console.  A code coverage report is also output as an html site to a specified folder.
- 'test-without-coverage' This task will only run unit test and will not collect code coverage reports.  Unit test results are output to the console.

#### options

Type: `Object`

This parameter is an object that holds the various options to use when registering the tasks.

#### options.testGlob

Type: `String` or `Array`

A glob or array of globs that identify the files in your project that contain mocha unit tests to be run.
Use [node-glob syntax](https://github.com/isaacs/node-glob) when specifying patterns.

#### options.codeGlob

Type: `String` or `Array`

A glob or array of globs that identify the files in your project that contain code to be included in code coverage reports.
Use [node-glob syntax](https://github.com/isaacs/node-glob) when specifying patterns.

#### options.thresholds

Type: `Object`

This is an object that is passed to the [gulp-istanbul](https://www.npmjs.com/package/gulp-istanbul#istanbul-enforcethresholds-opt) package to enforce thresholds for code coverage.
See the site for details on what thresholds can be inforced.

#### options.outputDir

Type: `String`

This is the directory to output any output files generated by testing and code coverage to.  For example the code coverage reports will be written to this folder.

#### options.require

Type: `String` or `Array`

Optional modules to require before running tests.

#### options.tasksPrefix

Type: `String`

This is an optional parameter that when set will add a prefix to the names of the tasks that get registered. For example, if tasksPrefix is set to 'hello' then the task that would have been registered with the name 'test-with-coverage' will be registered with the name 'hello-test-with-coverage' instead.

#### options.tasksDependencies

Type: `String[]`

Optional array of tasks names that must be completed before these registered tasks runs.