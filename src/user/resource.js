import Response from '../http/Response.js';

/**
 * To be
 *
 * @param
 * @returns
 */
export default class Resource {
  constructor(req, res) {
    this.req = req;
    this.res = new Response(res);
  }
}
