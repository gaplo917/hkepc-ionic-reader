module.exports = {
  getQueryVariable: (query, variable) => {
    if(query == "" || !query || query.indexOf('?') == -1) return "";
    let vars =  decodeURIComponent(query).split('?')[1].split('&')
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=')
      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1])
      }
    }
    console.log('Query variable %s not found', variable)
  },

  buildUrlFromState: ($state,$stateParams) => {
    "use strict";
    return $state.href($state.current.name, $stateParams)
  },

  isRelativeUrl: (url) =>{
    if(!url) return false;
    else return ! (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//'))
  },

  isFileSys: () => window.location.href.startsWith("file://") || window.location.href.startsWith("ms-appx-web://"),

  isProxy: () => !window.location.href.startsWith("file://") && !window.location.href.startsWith("ms-appx-web://")
}