/**
 * Created by Gaplo917 on 9/1/2016.
 */
export var localStorage = {
  name: '$localstorage',

  impl: ['$window',function ($window) {
    let cache = new Map();

    return {
      set: function(key, value) {
        cache.set(key,value)
        $window.localStorage[key] = value;
      },
      get: function(key, defaultValue) {
        const values = cache.get(key)
        if(!values){
          console.log('initilize cache')
          cache.set(key, $window.localStorage[key] || defaultValue)
        }
        return cache.get(key);
      },
      setObject: function(key, value) {
        cache.set(key,value)
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key) {
        const values = cache.get(key)
        if(!values){
          console.log('initilize cache')
          cache.set(key, JSON.parse($window.localStorage[key] || '{}'))
        }
        return cache.get(key);
      }
    }
  }]
}