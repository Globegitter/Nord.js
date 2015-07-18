import path from 'path';
import fs from 'fs-extra';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import tmp from 'tmp-sync';
import {sync as globSync} from 'glob';
const expect = chai.expect;
chai.use(sinonChai);

import Server from '../../lib/server.js';

describe('Unit: Server class', () => {
  let tmpdir;
  const root = process.cwd();
  const tmproot = path.join(root, 'tmp');

  beforeEach(() => {
    tmpdir = tmp.in(tmproot);
    process.chdir(tmpdir);
  });

  afterEach(() => {
    process.chdir(root);
    fs.removeSync(tmproot);
  });

  it('can transform the given folder and copy it to a tmp location', () => {
    const nordServer = new Server(path.join(__dirname, '..', '..', 'src'));
    const outPath = '.app';
    const outFiles = nordServer.transformAppCode(outPath);
    const actualFiles = globSync(`${outPath}/**/*.js`);

    expect(outFiles).to.deep.equal(actualFiles);
    expect(outFiles).to.be.instanceof(Array);
    expect(outFiles.length).to.be.greaterThan(1);
  });

  describe('SimpleRouter', () => {
    let req;
    let res;
    let nordServer;

    beforeEach(() => {
      nordServer = new Server(
        path.join(__dirname, '..', 'fixtures', 'nord-project', 'app')
      );

      req = {
        method: 'GET'
      };

      res = {
        statusCode: sinon.spy(),
        end       : sinon.spy()
      };
    });

    it('can route requests to the right files', async () => {
      req.url = 'great';

      await nordServer.simpleRouter(req, res);

      expect(res.statusCode).to.not.have.been.called;
      expect(res.end).to.have.been.calledOnce;
    });

    it('throws a 404 error if the routed file does not exist', async () => {
      req.url  = 'nonexistant';
      const nordServer = new Server(
        path.join(__dirname, '..', 'fixtures', 'nord-project', 'app')
      );

      await nordServer.simpleRouter(req, res);

      expect(res.statusCode).to.have.been.calledWith(404);
      expect(res.end).to.have.been.calledOnce;
    });

  });
});
