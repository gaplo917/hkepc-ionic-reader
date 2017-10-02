/**
 * Created by Gaplo917 on 3/10/2017.
 */
export class NativeChangeFontSizeRequest {
  static get NAME() { return 'NativeChangeFontSizeRequest'}

  constructor(size) {
    this.size = size
  }
}