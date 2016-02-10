/**
 * Created by Gaplo917 on 9/1/2016.
 */
export var localStorage = {
  name: '$localstorage',

  impl: ['$window',function ($window) {
    const cache = new Map();

    return {
      set: function(key, value) {
        cache.set(key,value)
        $window.localStorage[key] = value;
      },
      get: function(key, defaultValue) {
        const values = cache.get(key)
        if(!values){
          console.log('get initilize cache',key)
          cache.set(key, $window.localStorage[key] || defaultValue || 'undefined')
        }
        const cachedVal = cache.get(key)
        return cachedVal === 'undefined' ? undefined : cachedVal
      },
      setObject: function(key, value) {
        cache.set(key,value)
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key) {
        const values = cache.get(key)
        if(!values){
          console.log('getObject initilize cache')
          cache.set(key, JSON.parse($window.localStorage[key] || '{}'))
        }
        return cache.get(key);
      }
    }
  }]
}