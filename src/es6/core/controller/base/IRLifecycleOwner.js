export class IRLifecycleOwner {
  constructor ($scope) {
    this.$scope = $scope

    const lifeCycleMap = {
      onViewLoaded: '$ionicView.loaded',
      onViewEnter: '$ionicView.enter',
      onViewLeave: '$ionicView.leave',
      onViewBeforeEnter: '$ionicView.beforeEnter',
      onViewBeforeLeave: '$ionicView.beforeLeave',
      onViewAfterEnter: '$ionicView.afterEnter',
      onViewAfterLeave: '$ionicView.afterLeave',
      onViewUnloaded: '$ionicView.unloaded',
      onViewDestroy: '$destroy'
    }

    for (const customImpl in lifeCycleMap) {
      const lifecycle = lifeCycleMap[customImpl]
      if (typeof this[customImpl] === 'function') {
        // Cleanup the popover when we're done with it!
        $scope.$on(lifecycle, this[customImpl].bind(this))
      }
    }
  }
}
