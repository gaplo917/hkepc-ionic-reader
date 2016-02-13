/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

export class PostListController {

  constructor($scope,$http,$state,$stateParams,$location,$anchorScroll,$ionicSlideBoxDelegate,$ionicHistory,$ionicPopover,LocalStorageService,$ionicModal,ngToast,$q) {
    "use strict";
    console.log("called POST LIST CONTROLLER")
    this.scope = $scope
    this.http = $http
    this.state = $state
    this.location = $location
    this.anchorScroll = $anchorScroll
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate
    this.ionicHistory = $ionicHistory
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate
    this.localStorageService = LocalStorageService
    this.ngToast = ngToast
    this.q = $q

    this.topicId = $stateParams.topicId
    this.page = $stateParams.page
    this.pages = []
    this.categories = []
    this.slidePages = [{},{},{}]
    this.currentIndex = 0
    this.currentPageNum = this.page - 1
    this.showSpinner = true
    this.newPostModal = {}
    const newPostModal = this.scope.newPostModal = $scope.$new()
    newPostModal.post = {}

    newPostModal.hide = () => this.newPostModal.hide()
    newPostModal.show = () => {
      console.log( this.categories)
      newPostModal.categories = this.categories
      this.newPostModal.show()
    }
    newPostModal.openCategoryPopover = ($event) => {
      newPostModal.categoryPopover.show($event)
    }
    newPostModal.openGifPopover = ($event) => {
      newPostModal.gifs = HKEPC.data.gifs
      newPostModal.gifPopover.show($event)
    }
    newPostModal.addGifCodeToText = (code) => {
      newPostModal.gifPopover.hide()
      const selectionStart = document.getElementById('new-content').selectionStart

      const content = newPostModal.post.content || ""

      const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

      newPostModal.post.content = `${splits[0]} ${code} ${splits[1]}`

    }
    newPostModal.selectCategory = (category) => {
      newPostModal.categoryPopover.hide()
      newPostModal.post.category = category
    }
    newPostModal.doPublishNewPost = (post) => {
      console.log('do publist new post')

      const isValidInput = post.title && post.content
      const hasChoosenPostType =
            (post.category.id && newPostModal.categories.length > 0) ||
             newPostModal.categories.length == 0

      if(isValidInput && hasChoosenPostType){

        this.http.get(HKEPC.forum.newPost(this.topicId))
            .then((resp) => {
              let $ = cheerio.load(resp.data)

              const relativeUrl = $('#postform').attr('action')
              const postUrl = `${HKEPC.baseUrl}/${relativeUrl}&infloat=yes&inajax=1`

              const hiddenFormInputs = $(`input[type='hidden']`).map((i,elem) => {
                const k = $(elem).attr('name')
                const v = $(elem).attr('value')

                return `${k}=${encodeURIComponent(v)}`
              }).get()

              console.log(hiddenFormInputs)

              const ionicReaderSign = HKEPC.signature()

              const subject = post.title
              const replyMessage = `${post.content}\n\n${ionicReaderSign}`
              const undefinedFilter = /.*=undefined$/i
              const postData = [
                `subject=${encodeURIComponent(subject)}`,
                `message=${encodeURIComponent(replyMessage)}`,
                `typeid=${post.category.id}`,
                `handlekey=newthread`,
                `topicsubmit=true`,
                hiddenFormInputs.join('&')
              ].filter(e => !undefinedFilter.test(e))
                  .join('&')

              //Post to the server
              this.http({
                method: "POST",
                url : postUrl,
                data : postData,
                headers : {'Content-Type':'application/x-www-form-urlencoded'}
              }).then((resp) => {

                this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈主題！</i>`)

                newPostModal.hide()

                this.doRefresh()

              })

            })
      } else if(hasChoosenPostType) {
        this.ngToast.danger(`<i class="ion-alert-circled"> 標題或內容不能空白！</i>`)
      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 必須選擇新帖分類！</i>`)
      }
    }


    $ionicModal.fromTemplateUrl('templates/modals/new-post.html', {
      scope: newPostModal
    }).then((modal) => {
      this.newPostModal = modal

      $ionicPopover.fromTemplateUrl('templates/modals/gifs.html', {
        scope: newPostModal
      }).then((popover) => {
        newPostModal.gifPopover = popover;
      })

      $ionicPopover.fromTemplateUrl('templates/modals/categories.html', {
        scope: newPostModal
      }).then((popover) => {
        newPostModal.categoryPopover = popover;
      })

    })

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/modals/sub-forums.html', {
      scope: $scope
    }).then((popover) => {
      this.subTopicListPopover = popover
    })

    $ionicPopover.fromTemplateUrl('templates/modals/filter-order.html', {
      scope: $scope
    }).then((popover) => {
      this.filterOrderPopover = popover
    })

    $scope.openPopover = ($event) => {
      if(this.subTopicList && this.subTopicList.length > 0){
        this.subTopicListPopover.show($event)
      }
    }

    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', () => {
      this.subTopicListPopover.remove()
      this.newPostModal.remove()
    })

    // create a UI rendering queue
    this.queue = async.queue((task, callback) => {

      // update the post list
      const post = task()

      if(post.id || post.id != ""){
        const page = this.pages.find(p => p.num == post.pageNum)

        if(page){
          page.posts.push(post)
        }
      }

      if(this.queue.length() % 3 == 0){
        // force update the view after 3 task
        this.scope.$apply()
      }

      const delayRenderTime = post.isSticky && !this.showSticky ? 0 : 40
      setTimeout(() => callback(), delayRenderTime)
    }, 1)

    $scope.$on('$ionicView.loaded', (e) => {
      setTimeout(() => this.loadMore(), 200)
    })

    $scope.$on('$ionicView.enter', (e) => {
      this.queue.resume()

      // stringify and compare to string value
      this.showSticky = String(this.localStorageService.get('showSticky',true)) === 'true'
    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
      this.queue.pause()
    })
  }

  loadMore(cb){
    const nextPage = this.currentPageNum + 1
    const deferred = this.q.defer();

    this.http
        .get(HKEPC.forum.topics(this.topicId, nextPage, this.filter,this.order))
        .then((resp) => {
          // hide the spinner
          this.showSpinner = false

          let $ = cheerio.load(resp.data)
          const titles = $('#nav').text().split('»')
          const topicName = titles[titles.length - 1]
          const totalPageNumText = $('.pages_btns .pages .last').first().text() || $('.pages_btns .pages a').not('.next').last().text()
          const subTopicList = $('#subforum table h2 a').map((i,elem) => {
            const obj = $(elem)
            const name = obj.text()
            const id = URLUtils.getQueryVariable(obj.attr('href'), 'fid')
            return {
              id: id,
              name: name
            }
          }).get()

          const postCategories = this.categories.length == 0
              ? $('.threadtype a').map((i,elem) => {
                  const obj = $(elem)
                  return {
                    id: URLUtils.getQueryVariable(obj.attr('href'), 'typeid'),
                    name: obj.text()
                  }
                }).get()
              : this.categories

          // select the current login user
          const currentUsername = $('#umenu > cite').text()

          // send the login name to parent controller
          this.scope.$emit("accountTabUpdate",currentUsername)

          // only extract the number
          this.totalPageNum = totalPageNumText
                              ? totalPageNumText.match(/\d/g).join("")
                              : 1

          this.subTopicList = subTopicList.length > 0
                              ? subTopicList
                              : this.subTopicList

          this.categories = postCategories

          const tasks = $('.threadlist table tbody').map( (i, elem) => {
            return () => {
              const htmlId = $(elem).attr('id')

              const postSource = cheerio.load($(elem).html())
              const postUrl = postSource('tr .subject span a').attr('href')
              const postTitleImgUrl = postSource('tr .folder img').attr('src')

              return {
                id: URLUtils.getQueryVariable(postUrl, 'tid'),
                topicId: URLUtils.getQueryVariable(postUrl, 'fid'),
                tag: postSource('tr .subject em a').text(),
                name: postSource('tr .subject span[id^=thread_] a ').text(),
                lastPost:{
                  name: postSource('tr .lastpost cite a').text(),
                  timestamp: postSource('tr .lastpost em a').text()
                },
                author: {
                  name: postSource('tr .author a').text()
                },
                count: {
                  view: postSource('tr .nums em').text(),
                  reply: postSource('tr .nums strong').text()
                },
                publishDate: postSource('tr .author em').text(),
                pageNum: nextPage,
                isSticky: htmlId ? htmlId.startsWith("stickthread") : false,
                isRead: postTitleImgUrl ? postTitleImgUrl.indexOf('new') > 0 : false
              }
            }
          }).get()

          this.queue.push(tasks, (err) => {
            // callback of each task if any
          })

          // when all task finished
          this.queue.drain = () => {
            this.updateUI()
          }

          // push into the array
          this.pages.push({
            posts: [],
            num: nextPage
          })

          if(this.currentIndex == 0){
            this.slidePages[0] = this.pages[0]
          }

          this.topic = {
            id: this.topicId,
            name: topicName
          }
          deferred.resolve({})
        },(err) => deferred.reject(err))

    return deferred.promise
  }

  updateUI(){
    this.ionicSlideBoxDelegate.update()
    this.scope.$apply()
  }

  reset(){
    this.queue.kill()
    this.pages = []
    this.slidePages = [{},{},{}]
    this.ionicSlideBoxDelegate.slide(0,10)
    this.currentIndex = 0
    this.currentPageNum = 0
    this.showSpinner = true

  }

  doRefresh(){
    this.reset()
    if(this.filter) {
      const category = this.categories.find(e => e.id == this.filter)
      this.ngToast.success(`<i class="ion-ios-checkmark-outline"> 正在使用分類 - #${category.name} </i>`)
    }
    this.loadMore()
  }

  onSlideChanged(index){
    if(this.slidePages.length == 0) return 0

    this.showSpinner = true

    //scroll to the hash tag
    this.location.hash(`ionic-slide-box`)
    this.anchorScroll()

    // clear the model first
    //this.slidePages[index] = []

    setTimeout(() => {
      const diff = this.currentIndex - index
      const pagesNums = this.pages.map(p => p.num)
      this.currentPageNum = this.slidePages[this.currentIndex].num
      this.ionicSlideBoxDelegate.$getByHandle('slideshow-slidebox')._instances[0].loop(true)


      if(diff == 1 || diff == -2){

        if(this.currentPageNum ==  1 || (this.currentIndex == 1 && this.currentPageNum == 2)) {
          // disable the does-continue if the it is the initial page
          this.ionicSlideBoxDelegate.$getByHandle('slideshow-slidebox')._instances[0].loop(false)
        }

        // previous page, i.e.  2 -> 1 , 1 -> 0 , 0 -> 2
        const smallestPageNum = Math.min.apply(Math, pagesNums)

        if(this.currentPageNum > smallestPageNum){
          console.log("default previous page")
          this.slidePages[index] = this.pages.find(page => page.num == this.currentPageNum - 1)

          // prefetch for better UX
          const prefetchSlideIndex = index - 1 < 0 ? 2 : index - 1
          this.slidePages[prefetchSlideIndex] = this.pages.find(page => page.num == this.currentPageNum - 2)


        }
        else{
          console.log("loadMore Before()")
          // TODO: loadMoare beofre
        }
      }
      else{
        // next page
        const largestPageNum = Math.max.apply(Math, pagesNums)

        if(this.currentPageNum == this.totalPageNum){

          this.ngToast.warning("已到最後一頁！")
          // scroll back the previous slides
          this.ionicSlideBoxDelegate.previous()
        }
        if(this.currentPageNum >= largestPageNum){
          console.log("loadMore After()")
          this.slidePages[index] = []
          this.loadMore().then(() => {
            const len = this.pages.length -1
            const nextPage = Math.floor(len / 3) * 3 + index
            this.slidePages[this.currentIndex] = this.pages[nextPage - 1]
            this.slidePages[index] = this.pages[nextPage]

            // prefetch for better UX
            const prefetchSlideIndex = index + 1 > 2 ? 0 : index + 1
            this.slidePages[prefetchSlideIndex] = []
          })

        }
        else{
          console.log("default next page")
          this.slidePages[index] = this.pages.find(p => p.num == this.currentPageNum + 1)

          // prefetch for better UX
          const prefetchSlideIndex = index + 1 > 2 ? 0 : index + 1
          this.slidePages[prefetchSlideIndex] = this.pages.find(page => page.num == this.currentPageNum + 2)
        }

      }

      this.currentIndex = index
      this.updateUI()

    },100)

    console.log(`onSlideChanged${index}`)
  }


  goToSubTopic(index,subTopic){
    this.subTopicListPopover.hide();

    // swap the item in the list
    this.subTopicList[index] = this.topic
    this.topic = subTopic

    // override the topic id
    this.topicId = subTopic.id

    this.doRefresh()
  }

  saveShowSticky(bool) {
    this.localStorageService.set('showSticky',bool)
  }

  doNewPost(topic){
    const newPostModal = this.scope.newPostModal
    newPostModal.topic = topic
    newPostModal.show()

  }
  doFilterOrder($event){
    this.filterOrderPopover.show($event)
  }

  onBack(){
    const history = this.ionicHistory.viewHistory()
    if(history.backView && history.backView.stateName == 'tab.topics'){
      this.ionicHistory.goBack()
    } else {
      this.state.go('tab.topics')
    }
    console.log("on back")
  }
}
