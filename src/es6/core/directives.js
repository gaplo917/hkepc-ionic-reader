/**
 * Created by Gaplo917 on 31/1/2016.
 */

import * as HKEPC from '../data/config/hkepc'


/**
 * Register the directives
 */
export default
  angular.module('starter.directives', [])

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
      transclude: true,
      restrict: 'E',
      scope: {
        modal:'=',
        contentModel:'=',
        onImageUpload: '='
      },
      link: function (scope, element) {
        const modal = scope.modal

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
                scope.imageErrSuggestion = `作者推薦：使用 Telegram 發送圖片給自己 (一般圖片都能被壓縮少於 150 KB) 或使用其它圖片壓縮軟件。`
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

            const selectorId = modal.id
            const content = document.getElementById(selectorId).value

            const attachImageCode = `[attachimg]${attactmentId}[/attachimg]`
            scope.contentModel = `${content} \n${attachImageCode}`

            scope.onImageUpload({
              formData:`attachnew[${attactmentId}][description]=`,
              id: attactmentId
            })

            scope.imageUploadSuccess = `上傳成功，已插入 ${attachImageCode}。如你喜歡此功能，可到 關於 > 想支持作者? 內捐款支持！`

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
            const elem = document.getElementById(selectorId)
            elem.focus()
            elem.setSelectionRange(nselectionStart,nselectionStart)
          },100)

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
            const elem = document.getElementById(selectorId)
            elem.focus()
            elem.setSelectionRange(nselectionStart,nselectionStart)
          },100)

        }

        modal.addGifCodeToText = function(code) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

          scope.contentModel = `${splits[0]} ${code} ${splits[1]}`

          const nselectionStart = selectionStart + code.length + 1

          $timeout(() => {
            const elem = document.getElementById(selectorId)
            elem.focus()
            elem.setSelectionRange(nselectionStart,nselectionStart)
          },100)

        }

        modal.addImageUrlToText = function(imageUrl) {
          const selectorId = this.id
          const selectionStart = document.getElementById(selectorId).selectionStart
          const content = document.getElementById(selectorId).value
          const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

          scope.contentModel = `${splits[0]}[img]${imageUrl}[/img]${splits[1]}`
          scope.imageUrl = undefined
        }
      },

      templateUrl: 'templates/directives/input.helper.html'
    }
  })
