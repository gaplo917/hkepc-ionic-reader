
export const PaginationPopoverDelegates = ({
  $scope,
  $ionicPopover,
  $timeout,
  $ionicScrollDelegate
}, {
  getCurrentPage,
  getTotalPage,
  getLocalMinPage,
  onJumpPage
}) => {
  let pageSliderPopover = null

  // force init, ionic will cache it underlying
  $ionicPopover.fromTemplateUrl('templates/modals/page-slider.html').then((popover) => {
    pageSliderPopover = popover
    pageSliderPopover.scope.vm = {}
    const vm = pageSliderPopover.scope.vm

    vm.doJumpPage = () => {
      requestAnimationFrame(() => {
        $timeout(() => pageSliderPopover.hide(), 100)
      })

      onJumpPage({ to: vm.inputPage })
    }

    vm.doLoadPreviousPage = () => {
      requestAnimationFrame(() => {
        $timeout(() => pageSliderPopover.hide(), 100)
      })

      const minPageNum = getLocalMinPage()

      vm.inputPage = minPageNum === 1 ? 1 : minPageNum - 1

      $ionicScrollDelegate.scrollTop(true)
      onJumpPage({ to: vm.inputPage })
    }

    vm.floor = (i) => Math.floor(i)
    vm.ceil = (i) => Math.ceil(i)

    vm.getTimes = (i) => new Array(parseInt(i))

    vm.dismiss = () => pageSliderPopover.hide()
  })

  return {
    instance: pageSliderPopover,
    remove: () => {
      if (pageSliderPopover) {
        pageSliderPopover.remove()
      }
    },
    hide: () => {
      if (pageSliderPopover) {
        pageSliderPopover.hide()
      }
    },
    show: async ($event) => {
      if (pageSliderPopover) {
        const vm = pageSliderPopover.scope.vm
        vm.inputPage = getCurrentPage()
        vm.totalPageNum = getTotalPage()
        pageSliderPopover.show($event)
      }

    }
  }
}
