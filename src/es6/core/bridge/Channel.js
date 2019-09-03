export class Channel {
  // to Native
  static get apiProxy () { return 'API_PROXY' }

  static get nativeStorage () { return 'NATIVE_STORAGE' }

  static get uploadImage () { return 'UPLOAD_IMAGE' }

  static get iap () { return 'IAP' }

  static get version () { return 'VERSION' }

  static get share () { return 'SHARE' }

  static get actionSheet () { return 'ACTION_SHEET' }

  // from Native
  static get nativeStorageUpdated () { return 'NATIVE_STORAGE_UPDATE' }

  static get statusBarDidTap () { return 'STATUS_BAR_DID_TAP' }

  static get ping () { return 'PING' }
}
