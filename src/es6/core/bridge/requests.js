export class NativeChangeFontSizeRequest {
  static get NAME () { return 'NativeChangeFontSizeRequest' }

  constructor (size) {
    this.size = size
  }
}

export class NativeChangeThemeRequest {
  static get NAME () { return 'NativeChangeThemeRequest' }

  constructor (theme) {
    this.theme = theme
  }
}

export class NativeUpdateMHeadFixRequest {
  static get NAME () { return 'NativeUpdateMHeadFixRequest' }

  constructor (isMHead) {
    this.isMHead = isMHead
  }
}

export class NativeUpdateNotificationRequest {
  static get NAME () { return 'NativeUpdateNotificationRequest' }

  constructor (pmNotificationCount, postNotificationCount) {
    this.notification = {
      pm: parseInt(pmNotificationCount),
      post: parseInt(postNotificationCount)
    }
  }
}
