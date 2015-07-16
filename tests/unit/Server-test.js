import path from 'path';
import fs from 'fs-extra';

import {expect} from 'chai';
import tmp from 'tmp-sync';
import {sync as globSync} from 'glob';

import Server from '../../lib/Server.js';

describe('Unit: Server class', () => {
  let nordServer;
  let tmpdir;
  let root = process.cwd();
  let tmproot = path.join(root, 'tmp');

  before(() => {
    nordServer = new Server(path.join(__dirname, '..', '..', 'src'));
  });

  beforeEach(function () {
    tmpdir = tmp.in(tmproot);
    process.chdir(tmpdir);
  });

  afterEach(function () {
    process.chdir(root);
    fs.removeSync(tmproot);
  });

  it('can transform the given folder and copy it to a tmp location', () => {
    let outPath = '.app';
    let outFiles = nordServer.transformAppCode(outPath);
    let actualFiles = globSync(`${outPath}/**/*.js`);

    expect(outFiles).to.deep.equal(actualFiles);
    expect(outFiles).to.be.instanceof(Array);
    expect(outFiles.length).to.be.greaterThan(1);
  });
});
