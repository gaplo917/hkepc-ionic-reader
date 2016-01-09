module.exports = {
  getQueryVariable: (query, variable) => {
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
    return $state.href($state.current.name, $stateParams, {absolute: true})
  }
}