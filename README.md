# build-test

This package is currently in **BETA**

## Overview

This is a command line tool that performs testing and code coverage.
It uses [mocha](https://www.npmjs.com/package/mocha) to perform testing and [istanbul](https://www.npmjs.com/package/istanbul) to perform
code coverage.

## Guide

To start you will need to install this package for your project by executing the following command within your project from the console.

```
npm install --save-dev build-test
``` 
Once the package is installed you can run the tool from a terminal using the `build-test` command.  Normally you will
do this within an npm script element.  Take the following excerpt from an example package.json file:

```JSON
{
  "scripts": {
    "test": "build-test \"src/tests/*.spec.js\" -c \"src/**/*.js\" -c \"!src/tests/**/*.js\" ",
    "test-watch": "build-test \"src/tests/*.spec.js\" -c \"src/**/*.js\" -c \"!src/tests/**/*.js\" -w",
  }
}
```

In the example above the `test` script will run the tests found in files that end with a `.spec.js` extension within the `src/tests/` folder.
It will also provide code coverage metrics for files with an extension of `.js` within the `src/` but not the `src/tests/` folder.
The `test-watch` script will perform testing for the same `.spec.js` files whenever one of them is updated or added.

Also notice that the glob patterns are surrounded by double quotes.  This is necessary in order to prevent the terminal from expanding
the glob patterns into actual file paths.

## API

Usage:
```
build-test <files> [<files>] [-c <files>]  
           [-o <out directory>] [-w] [-f <format>] [-r <module>]  
           [--branches <number>] [--functions <number>] [--lines <number>] [--statements <number>]
```
Options:

| Option | Description |
| ---    | ---         |
| `<files>` | A glob pattern that identifies files that contain unit tests.  Multiple glob patterns can be specified. |
| -c     | A glob pattern that identifies files to produce code coverage metrics for. Multiple glob patterns can be specified. |
| -f     | The format for the output.  Options are: console, file. |
| -o     | The directory to send output to.  This defaults to testResults/. |
| -r     | A modue to require before any tests are run. |
| -w     | When present the files specified in the files glob pattern(s) will be watched for changes and tested when they do change. |
| --branches    | Global branch coverage threshold when code coverage is performed. |
| --functions   | Global function coverage threshold when code coverage is performed. |
| --lines       | Global line coverage threshold when code coverage is performed. |
| --statements  | Global statement coverage threshold when code coverage is performed. |