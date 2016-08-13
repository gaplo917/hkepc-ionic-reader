export class ChangeFontSizeRequest {
  static get NAME() { return 'ChangeFontSizeRequest'}

  constructor(size) {
    this.size = size
  }
}