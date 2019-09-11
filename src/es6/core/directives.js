/**
 * Created by Gaplo917 on 31/1/2016.
 */

import * as HKEPC from '../data/config/hkepc'
import { Bridge, Channel } from './bridge/index'

const SCROLLING_UP = -1
const SCROLLING_DOWN = 1

/**
 * Register the directives
 */
export default angular.module('starter.directives', [])
  .directive('compile', ($compile) => {
    return (scope, element, attrs) => {
      scope.$watch(
        (scope) => {
          return scope.$eval(attrs.compile)
        },
        (value) => {
          element.html(value)
          $compile(element.contents())(scope)
        }
      )
    }
  })
  .directive('inputHelper', ($timeout) => {
    return {
      restrict: 'E',
      scope: {
        modal: '=',
        contentModel: '='
      },
      link: function (scope, element) {
        const modal = scope.modal

        scope.selectTab = (index) => {
          if (index === 4) {
            if (Bridge.isAvailable()) {
              Bridge.callHandler(Channel.uploadImage, modal.hiddenAttachFormInputs, (attachmentIds) => {
                modal.onImageUploadSuccess(attachmentIds)

                $timeout(() => {
                  scope.$evalAsync()
                })
              })
            } else {
              alert('This feature only support in mobile app')
            }
          } else {
            modal.showInputHelperAt = index
          }
        }
        scope.isTab = (index) => {
          return modal.showInputHelperAt === index
        }
        scope.isSelectedTab = () => {
          return modal.showInputHelperAt >= 0
        }

        modal.gifs = HKEPC.data.gifs

        modal.addUrlToText = function (url, urlText) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0, selectionStart), content.slice(selectionStart)]

          if (urlText) {
            scope.contentModel = `${splits[0]}[url=${url}]${urlText}[/url]${splits[1]}`
          } else {
            scope.contentModel = `${splits[0]}[url]${url}[/url]${splits[1]}`
          }

          scope.url = undefined
          scope.urlText = undefined
          $timeout(() => {
            scope.$evalAsync()
          })
        }

        modal.addTextStyleTagToText = function (tag) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0, selectionStart), content.slice(selectionStart)]

          console.log(splits)
          const openTag = `[${tag}]`
          const closeTag = `[/${tag}]`
          if (tag === 'hr') {
            scope.contentModel = `${splits[0]}${openTag}${splits[1]}`
          } else {
            scope.contentModel = `${splits[0]}${openTag}${closeTag}${splits[1]}`
          }

          const nselectionStart = selectionStart + openTag.length

          $timeout(() => {
            scope.$apply(() => {
              const elem = document.getElementById(selectorId)
              elem.focus()
              $timeout(() => {
                elem.setSelectionRange(nselectionStart, nselectionStart)
              }, 200)
            })
          })
        }
        modal.addFontSizeTagToText = function (size) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0, selectionStart), content.slice(selectionStart)]

          const openTag = `[size=${size}]`
          const closeTag = `[/size]`

          scope.contentModel = `${splits[0]}${openTag}${closeTag}${splits[1]}`

          const nselectionStart = selectionStart + openTag.length
          $timeout(() => {
            scope.$apply(() => {
              const elem = document.getElementById(selectorId)
              elem.focus()

              $timeout(() => {
                elem.setSelectionRange(nselectionStart, nselectionStart)
              }, 200)
            })
          })
        }

        modal.addGifCodeToText = function (code) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0, selectionStart), content.slice(selectionStart)]

          scope.contentModel = `${splits[0]} ${code} ${splits[1]}`
        }

        modal.addImageUrlToText = function (imageUrl) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0, selectionStart), content.slice(selectionStart)]

          scope.contentModel = `${splits[0]}[img]${imageUrl}[/img]${splits[1]}`
          scope.imageUrl = undefined

          $timeout(() => {
            scope.$apply()
          })
        }
      },

      templateUrl: 'templates/directives/input.helper.html'
    }
  })
  .directive('onLongerThanScreen', ($window, $timeout) => {
    return {
      restrict: 'A',
      link: function ($scope, $elm, $attrs) {
        const screenHeight = $window.innerHeight
        $timeout(() => {
          const height = $elm[0].clientHeight
          if (height > screenHeight) {
            console.log(`onLongerThanScreen, elementHeight ${height} > ${screenHeight}`)

            $scope.$apply(function () {
              $scope.$eval($attrs.onLongerThanScreen)
            })
          }
        })
      }
    }
  })
  .directive('lazyScroll', ($rootScope, rx) => {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        const scrollEvents = $scope.$createObservableFunction('$onScroll')
          .observeOn(rx.Scheduler.async)
          .map(it => it.event)
          .share()

        const subscription1 = scrollEvents
          .map(event => (event && event.target && event.target.scrollTop) || 0)
          .bufferWithCount(2, 1) // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/bufferwithcount.md
          .subscribe(([lastScrollTop, currentScrollTop]) => {
            let scrollDirection = 0

            if (currentScrollTop > 0 && currentScrollTop > lastScrollTop) {
              scrollDirection = SCROLLING_DOWN
            } else {
              scrollDirection = SCROLLING_UP
            }

            $rootScope.$broadcast('scrollDirection', scrollDirection)
          })

        const subscription2 = scrollEvents
          .throttle(300, rx.Scheduler.async)
          .subscribe(({ event }) => {
            $scope.$broadcast('lazyScrollEvent')
          })

        $element.on('$destroy', function () {
          subscription1.dispose()
          subscription2.dispose()
        })
      }
    }
  })
  .directive('lastread', ($document, rx) => {
    return {
      restrict: 'A',
      scope: true,
      link: ($scope, $element, $attributes) => {
        const subscription = $scope.$eventToObservable('lazyScrollEvent')
          .startWith(1)
          .observeOn(rx.Scheduler.async)
          .filter(() => {
            const clientHeight = $document[0].documentElement.clientHeight
            const imageRect = $element[0].getBoundingClientRect()
            return (imageRect.top >= 0 && imageRect.top <= clientHeight / 2)
          })
          .subscribe(() => {
            $scope.$emit('lastread', { page: $attributes.page, id: $attributes.id })
          })

        $element.on('$destroy', function () {
          subscription.dispose()
        })
      }
    }
  })
  .directive('imageLazySrc', ($document, rx) => {
    return {
      restrict: 'A',
      scope: {
        imageLazySrc: '@'
      },
      link: function ($scope, $element, $attributes) {
        const subscription = $scope.$eventToObservable('lazyScrollEvent')
          .startWith(1)
          .observeOn(rx.Scheduler.async)
          .filter(() => {
            const clientHeight = $document[0].documentElement.clientHeight
            const imageRect = $element[0].getBoundingClientRect()
            return (imageRect.top >= 0 && imageRect.top <= clientHeight)
          })
          .take(1)
          .safeApply($scope, () => {
            $element[0].src = $attributes.imageLazySrc // set src attribute on element (it will load image)
          })
          .subscribe()

        // wrap a container
        $element.wrap('<div class="lazy-loading-container"></div>')

        // bind listener
        $element.on('error', function (e) {
          $element.off('error')
          subscription.dispose()
        })

        // unbind event listeners if element was destroyed
        // it happens when you change view, etc
        $element.on('$destroy', function () {
          subscription.dispose()
        })
      }
    }
  })
  .directive('irSpinner', function () {
    return {
      restrict: 'E',
      template: `<div class="icon"></div>`

    }
  })
  .directive('pageIndicator', (rx, $rootScope) => {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        paginationPopoverDelegate: '=',
        currentPage: '=',
        totalPage: '=',
        click: '&onClick'
      },
      template: `
        <div class="page-indicator-wrapper">
            <button ng-click="paginationPopoverDelegate.show($event)" 
                    ng-if="totalPage" 
                    class="button-rounded action-button action-button-small">
                第 {{currentPage == 0 ? 1 : currentPage}} 頁 / 共 {{totalPage}} 頁
            </button>
            <div class="tab-bar-inset"></div>
        </div>`,
      link: function ($scope, $element) {
        const subscription = $rootScope.$eventToObservable('scrollDirection')
          .observeOn(rx.Scheduler.async)
          .skipUntil(rx.Observable.timer(1000))
          .map(([, scrollDirection]) => scrollDirection)
          .throttle(16, rx.Scheduler.async) // at least wait a frame after a changed value
          .subscribe(scrollDirection => {
            if (scrollDirection === SCROLLING_DOWN) {
              if (!$element.hasClass('hidden')) {
                requestAnimationFrame(() => $element.addClass('hidden'))
              }
            } else if (scrollDirection === SCROLLING_UP) {
              if ($element.hasClass('hidden')) {
                requestAnimationFrame(() => $element.removeClass('hidden'))
              }
            }
          })

        $scope.$on('$destroy', function() {
          subscription.dispose()
        })
      }
    }
  })
