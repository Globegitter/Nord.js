/*global exit, target*/
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

require('shelljs/make');
let chalk = require('chalk');
let which = require('npm-which')(process.cwd());
let spawn = require('child_process').spawnSync;


//------------------------------------------------------------------------------
// Data
//------------------------------------------------------------------------------

let NODE = which.sync('node');
let ESLINT = which.sync('eslint');

// let SOURCE_DIR = 'src';
// let BUILD_DIR = 'lib';
let SOURCE_DIR = 'lib';
let TEST_DIR = 'tests';
let SANE_BIN = 'bin/sane';

let TEST_RUNNER = 'tests/runner';
let UNIT_OPT = 'unit';
let ACCEPTANCE_OPT = 'acceptance';


//------------------------------------------------------------------------------
// Tasks
//------------------------------------------------------------------------------

target.lint = function () {
  let lastReturn;
  let errors = 0;

  process.stdout.write('Linting Source Files ');
  lastReturn = spawn(ESLINT, [SOURCE_DIR, SANE_BIN], { stdio: 'inherit' });
  if (lastReturn.status !== 0) {
    errors++;
  } else {
    console.log(chalk.green('OK'));
  }

  process.stdout.write('Linting Test Files ');
  lastReturn = spawn(ESLINT, [TEST_DIR], { stdio: 'inherit' });
  if (lastReturn.status !== 0) {
    errors++;
  } else {
    console.log(chalk.green('OK'));
  }

  if (errors) {
    console.error(chalk.red('ERR!'), 'Linting failed.  See above for details.');
    exit();
  }

};

target.test = function () {
  target.lint();
  let lastReturn;
  let errors = 0;

  console.log('Running Unit Tests');
  lastReturn = spawn(NODE, [TEST_RUNNER, UNIT_OPT], { stdio: 'inherit' });
  errors = errors + lastReturn.status;

  console.log('Running Acceptance Tests');
  lastReturn = spawn(NODE, [TEST_RUNNER, ACCEPTANCE_OPT], { stdio: 'inherit' });
  errors = errors + lastReturn.status;

  if (errors) {
    console.error(chalk.red('ERR!'), errors, 'test(s) failed.  See above for details.');
    exit();
  }

};
