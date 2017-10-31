// Bridge wrapper
// Designed for wrapping both iOS & Android bridge
export class Bridge {
  static get instance(){
    return Bridge._instance
  }

  static set instance(bridge){
    Bridge._instance = bridge
  }

  static callHandler(channel, opt, cb){
    Bridge._instance.callHandler(channel, opt, cb)
  }

  static registerHandler(channel, cb){
    Bridge._instance.registerHandler(channel, cb)
  }

  static isAvailable(){
    return Bridge._instance
  }

  static isAndroidNative(){
    return Bridge._instance.platform === 'android'
  }

  static isiOSNative(){
    return Bridge._instance.platform === 'ios'
  }

}