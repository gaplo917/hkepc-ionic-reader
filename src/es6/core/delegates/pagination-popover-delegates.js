
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

  const load = () => {
    return $ionicPopover.fromTemplateUrl('templates/modals/page-slider.html').then((popover) => {
      popover.scope.vm = {}

      const vm = popover.scope.vm

      vm.doJumpPage = () => {
        requestAnimationFrame(() => {
          $timeout(() => popover.hide(), 100)
        })

        onJumpPage({ to: vm.inputPage })
      }

      vm.doLoadPreviousPage = () => {
        requestAnimationFrame(() => {
          $timeout(() => popover.hide(), 100)
        })

        const minPageNum = getLocalMinPage()

        vm.inputPage = minPageNum === 1 ? 1 : minPageNum - 1

        $ionicScrollDelegate.scrollTop(true)
        onJumpPage({ to: vm.inputPage })
      }

      vm.floor = (i) => Math.floor(i)
      vm.ceil = (i) => Math.ceil(i)

      vm.getTimes = (i) => new Array(parseInt(i))

      return popover
    })
  }

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
      if (pageSliderPopover === null) {
        pageSliderPopover = await load()
      }
      const vm = pageSliderPopover.scope.vm
      vm.inputPage = getCurrentPage()
      vm.totalPageNum = getTotalPage()
      pageSliderPopover.show($event)
    }
  }
}
