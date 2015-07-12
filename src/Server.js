import {System} from 'es6-module-loader';
import http from 'http';

System.transpiler = 'babel';

export default class NextServer {

  constructor(port=8080) {
    this.port = port;
  }

  // function to handle requests and send response
  async handleRequest(req, res) {
    let path = req.url.slice(1);

    try {
      let UserResource = await System.import(`./app/${path}.js`);
      // console.log(UserResource);
      let resource = new UserResource.default(req, res); // eslint-disable-line new-cap
      console.log(resource.get());
    } catch (error) {
      if (error.message.includes('ENOENT')) {
        // res.statusCode(404)
        return res.end('404 error!');
      } else {
        res.statusCode(500);
        return res.end('Internal error', error);
      }
      // return res.end('Whhaaa');
    }

    return res.end();
  }

  start() {
    // Create a server
    let server = http.createServer(this.handleRequest);

    // Lets start our server
    server.listen(this.port,  () => {
      // Callback triggered when server is successfully listening. Hurray!
      console.log(`Server started on: http://localhost:${this.port}`);
    });
  }
}
