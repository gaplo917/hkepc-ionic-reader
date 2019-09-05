export class ChangeFontSizeRequest {
  static get NAME () { return 'ChangeFontSizeRequest' }

  constructor (size) {
    this.size = size
  }
}

export class ChangeThemeRequest {
  static get NAME () { return 'ChangeThemeRequest' }

  constructor (theme) {
    this.theme = theme
  }
}

export class CommonInfoExtractRequest {
  static get NAME () { return 'CommonInfoExtractRequest' }

  constructor (username, pmNotification, postNotification, formhash) {
    this.username = username
    this.pmNotification = pmNotification
    this.postNotification = postNotification
    this.formhash = formhash
  }
}

export class FindMessageRequest {
  static get NAME () { return 'FindMessageRequest' }

  constructor (postId, messageId) {
    this.postId = postId
    this.messageId = messageId
  }
}

export class LoginTabUpdateRequest {
  static get NAME () { return 'LoginTabUpdateRequest' }

  constructor (username, isFromLogout = false) {
    this.username = username
    this.isFromLogout = isFromLogout
  }
}

export class NotificationBadgeUpdateRequest {
  static get NAME () { return 'NotificationBadgeUpdateRequest' }

  constructor (pmNotificationCount, postNotificationCount) {
    this.notification = {
      pm: parseInt(pmNotificationCount),
      post: parseInt(postNotificationCount)
    }
  }
}

export class PostDetailRefreshRequest {
  static get NAME () { return 'PostDetailRefreshRequest' }
}

export class PostListRefreshRequest {
  static get NAME () { return 'PostListRefreshRequest' }
}

export class PushHistoryRequest {
  static get NAME () { return 'PushHistoryRequest' }

  constructor (any) {
    this.historyObj = any
  }
}

export class MHeadFixRequest {
  static get NAME () { return 'MHeadFixRequest' }

  constructor (mHeadFix) {
    this.mHeadFix = mHeadFix
  }
}

export class AndroidBottomFixRequest {
  static get NAME () { return 'AndroidBottomFixRequest' }

  constructor (androidBottomFix) {
    this.androidBottomFix = androidBottomFix
  }
}
