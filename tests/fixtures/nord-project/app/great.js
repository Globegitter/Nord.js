import Resource from '../../../../lib/user/resource';

export default class Great extends Resource{
  get() {
    return 'working!';
  }
}
