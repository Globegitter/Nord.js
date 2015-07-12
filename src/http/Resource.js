import Response from './Response.js';

export default class Resource{
  constructor(req, res) {
    this.req = req;
    this.res = new Response(res);
  }
}
