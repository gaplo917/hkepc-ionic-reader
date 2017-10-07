export class Channel {
  // to Native
  static get apiProxy(){ return "API_PROXY" }
  static get nativeStorage(){ return "NATIVE_STORAGE" }

  // from Native
  static get nativeStorageUpdated(){ return "NATIVE_STORAGE_UPDATE" }
  static get statusBarDidTap(){ return "STATUS_BAR_DID_TAP" }

}