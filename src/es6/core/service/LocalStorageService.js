/**
 * Created by Gaplo917 on 9/1/2016.
 */
export class LocalStorageService {
  static get NAME() { return 'LocalStorageService'}

  constructor($window) {
    this.window = $window
    this.cache = new Map();

  }
  set(key, value) {
    this.cache.set(key,value)
    this.window.localStorage[key] = value;
  }
  
  get(key, defaultValue) {
    const values = this.cache.get(key)
    if(!values){
      console.log('get initilize this.cache',key)
      this.cache.set(key, this.window.localStorage[key] || defaultValue || 'undefined')
    }
    const cachedVal = this.cache.get(key)
    return cachedVal === 'undefined' ? undefined : cachedVal
  }
  
  setObject(key, value) {
    this.cache.set(key,value)
    this.window.localStorage[key] = JSON.stringify(value);
  }
  
  getObject(key) {
    const values = this.cache.get(key)
    if(!values){
      console.log('getObject initilize this.cache')
      this.cache.set(key, JSON.parse(this.window.localStorage[key] || '{}'))
    }
    return this.cache.get(key);
  }
}
    
