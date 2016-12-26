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
  .directive('inputHelper', () => {
    return {
      transclude: true,
      restrict: 'E',
      scope: {
        modal:'=',
        contentModel:'='
      },
      link: function (scope, element) {

        const modal = scope.modal

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

          setTimeout(() => {
            const elem = document.getElementById(selectorId)
            elem.focus()
            elem.setSelectionRange(nselectionStart,nselectionStart)
          },300)

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

          setTimeout(() => {
            const elem = document.getElementById(selectorId)
            elem.focus()
            elem.setSelectionRange(nselectionStart,nselectionStart)
          },300)


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
        }
      },

      templateUrl: 'templates/directives/input.helper.html'
    }
  })