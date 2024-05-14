export class Utils {
  static deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
}
