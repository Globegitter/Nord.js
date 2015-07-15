/*eslint no-process-exit:0*/
'use strict';

let glob  = require('glob');
let Mocha = require('mocha');

require('babel/register');

let mocha = new Mocha({
  // For some reason, tests take a long time on Windows (or at least AppVeyor)
  timeout : (process.platform === 'win32') ? 150000 : 40000,
  reporter: 'spec'
});

// Determine which tests to run based on argument passed to runner
let arg = process.argv[2];
let root;
if (!arg) {
  root = 'tests/{unit,acceptance}';
} else if (arg === 'unit') {
  root = 'tests/unit';
} else {
  root = 'tests/{unit,acceptance}';
}

function addFiles(mocha, files) {
  glob.sync(root + files).forEach(mocha.addFile.bind(mocha));
}

addFiles(mocha, '/**/*Test.js');

mocha.run(function (failures) {
  process.on('exit', function () {
    if (failures === 1) {
      console.log('1 Failing Test');
    } else if (failures > 1) {
      console.log(failures, 'Failing Tests');
    } else if (failures === 0) {
      console.log('All Tests Passed!');
    }
    process.exit(failures);
  });
});
