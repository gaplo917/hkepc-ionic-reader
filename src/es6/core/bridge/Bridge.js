// Bridge wrapper
// Designed for wrapping both iOS & Android bridge
import {Channel} from "./Channel";
const uuid = require('uuid-v4');

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
    return Bridge._instance && Bridge._instance.platform === 'android'
  }

  static isiOSNative(){
    return Bridge._instance && Bridge._instance.platform === 'ios'
  }

  static version(cb){
    Bridge._instance.callHandler(Channel.version, {}, (data) => {
      cb(data.version)
    })
  }

}

export function isiOSNative() {
  return window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.isIRNative
}

export function isAndroidNative() {
  return window.Android
}

export function isLegacyAndroid() {
  return window.LegacyAndroid
}

export function createIOSNativeBride(cb) {

  function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
      return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () { document.documentElement.removeChild(WVJBIframe) }, 0)
  }

  setupWebViewJavascriptBridge(bridge => {
    console.log("web view javascript bridge ready")
    Bridge.instance = bridge
    Bridge.instance.platform = 'ios'

    window.Bridge = Bridge

    cb()
  })
}

export function createAndroidNativeBridge(cb){
  console.log("Android webview bridge is ready", window.Android)

  let port = null;
  let handlers = new Map()
  let channelHandlers = new Map()
  window.onmessage = function (e) {
    console.log("Native web message port received", e)

    // ensure only run once
    if (!e.ports[0] || port !== null) return

    port = e.ports[0]

    port.onmessage = function (f) {
      try {
        const msg = JSON.parse(f.data)
        console.log(`receieve data from native `, msg)
        const uid = msg.uid
        const handler = handlers.get(uid)

        if(handler){
            try {
              const jsObj = JSON.parse(msg.data)
              handler(jsObj)
            } catch (e) {
              console.warn("fail to handle cb or json parsing",e)
              handler(msg.data)
            }
            handlers.delete(uid)
            return
        }

        const channel = msg.channel
        const rHandler = channelHandlers.get(channel)

        if(rHandler){
            rHandler(JSON.parse(msg.data), (data) => {
                port.postMessage(JSON.stringify({
                    uid:     msg.uid,
                    channel: msg.channel,
                    data:    JSON.stringify(data)
                }))
            })
        }

      } catch (e) {
        console.warn(`message from native encounter parsing error "${f.data}"`, e)
      }
    }

    Bridge.instance = {
      platform: 'android',
      // call native
      callHandler: (channel, opt, cb) => {
        const uid = uuid()

        port.postMessage(JSON.stringify({
          uid:     uid,
          channel: channel,
          data:    JSON.stringify(opt)
        }))

        if (typeof cb === "function") {
          handlers.set(uid, cb)
        }

      },
      // receive native message
      registerHandler: (channel, cb) => {
        handlers.set(channel, cb)
      }
    }

    window.Bridge = Bridge

    cb()
  }
}
