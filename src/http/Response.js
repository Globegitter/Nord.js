export default class Response{
  constructor(res) {
    this.res = res;
  }

  /**
   * Creates a JSON response
   *
   * @param {object} content
   */
  json(content) {
    this.res.writeHead(200, { 'Content-Type': 'application/json' });
    this.res.write(JSON.stringify(content));
  }
}
