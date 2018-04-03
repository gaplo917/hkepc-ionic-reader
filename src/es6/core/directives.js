/**
 * Created by Gaplo917 on 31/1/2016.
 */

import * as HKEPC from '../data/config/hkepc'
import { Bridge, Channel } from './bridge/index'

/**
 * Register the directives
 */
export default
  angular.module('starter.directives', ['ngAnimate'])

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
      )};
  }])
  .directive('lastread', ($document, $timeout, $ionicScrollDelegate) => {
    return {
        restrict: 'A',
        scope: true,
        link: ($scope, $element, $attributes) => {

          const deregistration = $scope.$on('lazyScrollEvent', () => {
            if (isInView()) {
              //console.log("isInView",$attributes.id,$attributes.page)
              $scope.$emit('lastread', { page: $attributes.page, id: $attributes.id })
            }
          })

          function isInView() {
            var clientHeight = $document[0].documentElement.clientHeight;
            // var clientWidth = $document[0].documentElement.clientWidth;
            var imageRect = $element[0].getBoundingClientRect();

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
              $scope.$emit('lastread', { page: $attributes.page, id: $attributes.id })
              deregistration();
            }
          });

        }
      }

  })
  .directive('inputHelper', (Upload,$timeout) => {
    return {
      restrict: 'E',
      scope: {
        modal:'=',
        contentModel:'=',
        onImageUpload: '='
      },
      link: function (scope, element) {
        const modal = scope.modal

        scope.selectTab = (index) => {
          if(index === 4 && Bridge.isAvailable()){
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
              const fileSizeInKB = e.total/1000
              if(fileSizeInKB >= 150){

                scope.imageErr = `圖片(${fileSizeInKB} KB) 大於 HKEPC 限制(150KB)`
                scope.imageErrSuggestion = `iOS 用家：可使用 Apple 新收購的 Work Flow 配搭作者設計專用的 Script 壓縮圖片。<a href="" target="_system" onclick="window.open('https://blog.gaplotech.com/workflow-x-hkepc-ir/', '_system', 'location=yes'); return false;">查看此教學</a>`
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
          if(!modal.hiddenAttachFormInputs){
            throw new Error("Modal Missing hiddenAttachFormInputs")
          }

          const data = modal.hiddenAttachFormInputs
          data.Filedata = scope.file

          Upload.upload({
            url: data.action,
            data: data
          }).then(function (resp) {
            console.log('Success uploaded. Response: ' , resp.data);

            //DISCUZUPLOAD|0|1948831|1
            const attactmentId = resp.data.split('|')[2]

            modal.onImageUpload({
              formData:`attachnew[${attactmentId}][description]=`,
              id: attactmentId
            })

            scope.imageUploadSuccess = `上傳成功，已插入 ${attachImageCode}！`

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

        modal.addUrlToText = function(url,urlText) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

          if(urlText) {
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

        modal.addTextStyleTagToText = function(tag) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

          console.log(splits)
          const openTag = `[${tag}]`
          const closeTag = `[/${tag}]`
          if(tag == 'hr'){
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
                elem.setSelectionRange(nselectionStart,nselectionStart)
              },200)
            })
          })


        }
        modal.addFontSizeTagToText = function(size) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

          const openTag = `[size=${size}]`
          const closeTag = `[/size]`

          scope.contentModel = `${splits[0]}${openTag}${closeTag}${splits[1]}`

          const nselectionStart = selectionStart + openTag.length
          $timeout(() => {
            scope.$apply(() => {
              const elem = document.getElementById(selectorId)
              elem.focus()

              $timeout(() => {
                elem.setSelectionRange(nselectionStart,nselectionStart)
              },200)
            })
          })

        }

        modal.addGifCodeToText = function(code) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

          scope.contentModel = `${splits[0]} ${code} ${splits[1]}`
        }

        modal.addImageUrlToText = function(imageUrl) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

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
  .directive('onLongPress', function($timeout) {
    return {
      restrict: 'A',
      link: function($scope, $elm, $attrs) {
        $elm.bind('touchstart', function(evt) {
          // Locally scoped variable that will keep track of the long press
          $scope.longPress = true;

          // We'll set a timeout for 600 ms for a long press
          $timeout(function() {
            if ($scope.longPress) {
              // If the touchend event hasn't fired,
              // apply the function given in on the element's on-long-press attribute
              $scope.$apply(function() {
                $scope.$eval($attrs.onLongPress)
              });

              $scope.triggeredLongPress = true
            }
          }, 600);
        });

        $elm.bind('touchend', function(evt) {
          if(!$scope.triggeredLongPress){
            // no long press is triggered, show try to trigger short press
            if ($attrs.onShortPress){
              $scope.$apply(function() {
                $scope.$eval($attrs.onShortPress)
              });
            }

          }

          $scope.triggeredLongPress = false
          // Prevent the onLongPress event from firing
          $scope.longPress = false;
          // If there is an on-touch-end function attached to this element, apply it
          if ($attrs.onTouchEnd) {
            $scope.$apply(function() {
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
          link: function ($scope, $elm, $attrs) {
              const screenHeight = $window.innerHeight
              $timeout(() => {
                const height = $elm[0].clientHeight
                if(height > screenHeight){

                  console.log(`onLongerThanScreen, elementHeight ${height} > ${screenHeight}`)

                  $scope.$apply(function() {
                    $scope.$eval($attrs.onLongerThanScreen)
                  });
                }
              })
          }
      }
  });
