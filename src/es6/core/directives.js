/**
 * Created by Gaplo917 on 31/1/2016.
 */

import * as HKEPC from '../data/config/hkepc'
import {Bridge, Channel} from './bridge/index'

/**
 * Register the directives
 */
export default angular.module('starter.directives', ['ngAnimate'])

  .directive('compile', ['$compile', ($compile) => {
    return (scope, element, attrs) => {
      scope.$watch(
        (scope) => {
          return scope.$eval(attrs.compile);
        },
        (value) => {
          element.html(value);
          $compile(element.contents())(scope);
        }
      )
    };
  }])
  .directive('lastread', ($document, $timeout) => {
    return {
      restrict: 'A',
      scope: true,
      link: ($scope, $element, $attributes) => {

        const deregistration = $scope.$on('lazyScrollEvent', () => {
          if (isInView()) {
            //console.log("isInView",$attributes.id,$attributes.page)
            $scope.$emit('lastread', {page: $attributes.page, id: $attributes.id})
          }
        })

        function isInView() {
          const clientHeight = $document[0].documentElement.clientHeight;
          // var clientWidth = $document[0].documentElement.clientWidth;
          const imageRect = $element[0].getBoundingClientRect();

          //console.log(`isInView height ${clientHeight}, width ${clientWidth}`,imageRect)

          // scroll to the half of the screen mean user if viewing
          return (imageRect.top >= 0 && imageRect.top <= clientHeight / 2)
        }

        // bind listener
        // listenerRemover = scrollAndResizeListener.bindListener(isInView);

        // unbind event listeners if element was destroyed
        // it happens when you change view, etc
        $element.on('$destroy', () => {
          deregistration();
        })

        $timeout(() => {
          if (isInView()) {
            $scope.$emit('lastread', {page: $attributes.page, id: $attributes.id})
          }
        });

      }
    }

  })
  .directive('inputHelper', (Upload, $timeout) => {
    return {
      restrict: 'E',
      scope:    {
        modal:         '=',
        contentModel:  '='
      },
      link:     function (scope, element) {
        const modal = scope.modal

        scope.selectTab = (index) => {
          if (index === 4 && Bridge.isAvailable()) {
            Bridge.callHandler(Channel.uploadImage, modal.hiddenAttachFormInputs, (attachmentIds) => {

              modal.onImageUploadSuccess(attachmentIds)

              $timeout(() => {
                scope.$apply()
              })
            })
          }
          else {
            modal.showInputHelperAt = index
          }
        }
        scope.isTab = (index) => {
          return modal.showInputHelperAt === index
        }
        scope.isSelectedTab = () => {
          return modal.showInputHelperAt >= 0
        }

        scope.prepareUpload = function (file) {
          scope.imageErr = undefined
          scope.imageErrSuggestion = undefined
          scope.previewUploadImage = undefined

          if (file) {
            var reader = new FileReader();

            reader.onload = function (e) {
              const fileSizeInKB = e.total / 1000
              if (fileSizeInKB >= 150) {

                scope.imageErr = `圖片(${fileSizeInKB} KB) 大於 HKEPC 限制(150KB)`
                scope.imageErrSuggestion = `建議使用具有自動壓縮功能的 iOS 或 Android (6.0 或以上) HKEPC IR Pro App`
              } else {
                // image is valid to upload
                scope.file = file
              }

              scope.previewUploadImage = e.target.result
              scope.$apply()
            }

            reader.readAsDataURL(file)
          }

        }

        scope.upload = function () {
          console.log("modal.hiddenAttachFormInputs", modal.hiddenAttachFormInputs)
          if (!modal.hiddenAttachFormInputs) {
            throw new Error("Modal Missing hiddenAttachFormInputs")
          }

          const data = modal.hiddenAttachFormInputs
          data.Filedata = scope.file

          Upload.upload({
            url:  data.action,
            data: data
          }).then(function (resp) {
            console.log('Success uploaded. Response: ', resp.data);

            //DISCUZUPLOAD|0|1948831|1
            const attactmentId = resp.data.split('|')[2]

            modal.onImageUploadSuccess([attactmentId])

            scope.imageUploadSuccess = `上傳成功 ${attactmentId}！`

            // release the file
            scope.file = undefined

          }, function (resp) {
            console.log('Error status: ' + resp.status);
          }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total)
            console.log('progress: ' + progressPercentage + '%')
          })
        }

        scope.resetUpload = function () {
          scope.imageErr = undefined
          scope.imageErrSuggestion = undefined
          scope.previewUploadImage = undefined
          scope.file = undefined
          scope.imageUploadSuccess = undefined
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
            scope.contentModel = `${splits[0]}[url=${url}][/url]${splits[1]}`
          }

          scope.url = undefined
          scope.urlText = undefined
          $timeout(() => {
            scope.$apply()
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
          if (tag == 'hr') {
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
  // Customize from https://gist.github.com/BobNisco/9885852
  .directive('onLongPress', function ($timeout) {
    return {
      restrict: 'A',
      link:     function ($scope, $elm, $attrs) {
        $elm.bind('touchstart', function (evt) {
          // Locally scoped variable that will keep track of the long press
          $scope.longPress = true;

          // We'll set a timeout for 600 ms for a long press
          $timeout(function () {
            if ($scope.longPress) {
              // If the touchend event hasn't fired,
              // apply the function given in on the element's on-long-press attribute
              $scope.$apply(function () {
                $scope.$eval($attrs.onLongPress)
              });

              $scope.triggeredLongPress = true
            }
          }, 600);
        });

        $elm.bind('touchend', function (evt) {
          if (!$scope.triggeredLongPress) {
            // no long press is triggered, show try to trigger short press
            if ($attrs.onShortPress) {
              $scope.$apply(function () {
                $scope.$eval($attrs.onShortPress)
              });
            }

          }

          $scope.triggeredLongPress = false
          // Prevent the onLongPress event from firing
          $scope.longPress = false;
          // If there is an on-touch-end function attached to this element, apply it
          if ($attrs.onTouchEnd) {
            $scope.$apply(function () {
              $scope.$eval($attrs.onTouchEnd)
            });
          }
        });
      }
    };
  })
  .directive('onLongerThanScreen', function ($window, $document, $timeout) {
    return {
      restrict: 'A',
      link:     function ($scope, $elm, $attrs) {
        const screenHeight = $window.innerHeight
        $timeout(() => {
          const height = $elm[0].clientHeight
          if (height > screenHeight) {

            console.log(`onLongerThanScreen, elementHeight ${height} > ${screenHeight}`)

            $scope.$apply(function () {
              $scope.$eval($attrs.onLongerThanScreen)
            });
          }
        })
      }
    }
  })
  .directive('onLongerThanScreen', function ($window, $document, $timeout) {
    return {
      restrict: 'A',
      link:     function ($scope, $elm, $attrs) {
        const screenHeight = $window.innerHeight
        $timeout(() => {
          const height = $elm[0].clientHeight
          if (height > screenHeight) {

            console.log(`onLongerThanScreen, elementHeight ${height} > ${screenHeight}`)

            $scope.$applyAsync(function () {
              $scope.$eval($attrs.onLongerThanScreen)
            });
          }
        })
      }
    }
  })
  .directive('lazyScroll', ['$rootScope',
    function ($rootScope) {
      return {
        restrict: 'A',
        link: function ($scope, $element) {
          const origEvent = $scope.$onScroll;

          function throttle (func, wait, options) {
            let context, args, result;
            let timeout = null;
            let previous = 0;
            options || (options = {});
            let later = function() {
              previous = options.leading === false ? 0 : Date.now();
              timeout = null;
              result = func.apply(context, args);
            };
            return function() {
              let now = Date.now();
              if (!previous && options.leading === false) previous = now;
              let remaining = wait - (now - previous);
              context = this;
              args = arguments;
              if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
              } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
              }
              return result;
            };
          }

          const throttleEmit = throttle(() => {
            $rootScope.$broadcast('lazyScrollEvent')
          }, 300)

          $scope.$onScroll = function () {
            throttleEmit()

            if (typeof origEvent === 'function') {
              origEvent();
            }
          };
        }
      };
    }])

  .directive('imageLazySrc', ['$document', '$timeout', '$ionicScrollDelegate', '$compile',
    function ($document, $timeout, $ionicScrollDelegate, $compile) {
      return {
        restrict: 'A',
        scope: {
          lazyScrollResize:         "@lazyScrollResize",
          imageLazyBackgroundImage: "@imageLazyBackgroundImage",
          imageLazySrc:             "@"
        },
        link:     function ($scope, $element, $attributes) {
          const imageLazyDistanceFromBottomToLoad = $attributes.imageLazyDistanceFromBottomToLoad
            ? parseInt($attributes.imageLazyDistanceFromBottomToLoad)
            : 0

          let loader;
          let isLoaded = false

          const deregistration = $scope.$on('lazyScrollEvent', function () {
              console.log('lazy image receiving scrolling event');

              if (isInView()) {
                loadImage();
              }

              if(isLoaded){
                deregistration();
              }
            }
          );

          function loadImage() {
            if(!loader){
              loader = $compile(`<div style="height: 100px;display: flex;align-items: center;justify-content: center;"><ir-spinner></ir-spinner></div>`)($scope);
              $element.after(loader);
            }

            //Bind "load" event
            $element.bind("load", function (e) {
              if (loader) {
                loader.remove();
              }
              isLoaded = true
              $element.unbind("load");
            });

            if ($scope.imageLazyBackgroundImage == "true") {
              const bgImg = new Image();
              bgImg.onload = function () {
                if (loader) {
                  loader.remove();
                }
                $element[0].style.backgroundImage = 'url(' + $attributes.imageLazySrc + ')'; // set style attribute on element (it will load image)
              };
              bgImg.src = $attributes.imageLazySrc;
            } else {
              $element[0].src = $attributes.imageLazySrc; // set src attribute on element (it will load image)
            }
          }

          function isInView() {
            const clientHeight = $document[0].documentElement.clientHeight;
            const imageRect = $element[0].getBoundingClientRect();
            return (imageRect.top >= 0 && imageRect.top <= clientHeight + imageLazyDistanceFromBottomToLoad)
          }

          // bind listener
          // listenerRemover = scrollAndResizeListener.bindListener(isInView);

          // unbind event listeners if element was destroyed
          // it happens when you change view, etc
          $element.on('$destroy', function () {
            deregistration();
          });

          // explicitly call scroll listener (because, some images are in viewport already and we haven't scrolled yet)
          $timeout(function () {
            if (isInView()) {
              loadImage();
            }
          });
        }
      };
    }])
  .directive('irSpinner', function () {
    return {
      restrict: 'E',
      template: `<div class="icon"></div>`

    };
  });
