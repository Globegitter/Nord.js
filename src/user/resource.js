import Response from '../http/response';

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
