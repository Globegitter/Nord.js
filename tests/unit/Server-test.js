// import {expect} from 'chai';

import Server from '../../lib/Server.js';

describe('Server class', () => {
  let nordServer;
  before(() => {
    nordServer = new Server();
  });

  it('can transform the given file', () => {
    console.log(process.cwd());
    console.log(nordServer.transformFile('./Server-test.js'));
  });
});
