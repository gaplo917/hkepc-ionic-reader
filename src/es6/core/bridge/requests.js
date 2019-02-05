export class NativeChangeFontSizeRequest {
  static get NAME() { return 'NativeChangeFontSizeRequest'}

  constructor(size) {
    this.size = size
  }
}

export class NativeChangeThemeRequest {
  static get NAME() { return 'NativeChangeThemeRequest'}

  constructor(theme) {
    this.theme = theme
  }
}

export class NativeUpdateMHeadFixRequest {
  static get NAME() { return 'NativeUpdateMHeadFixRequest'}

  constructor(isMHead) {
    this.isMHead = isMHead
  }
}