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

export class NativeHideUsernameRequest {
  static get NAME() { return 'NativeHideUsernameRequest'}

  constructor(bool) {
    this.hideUsername = bool
  }
}