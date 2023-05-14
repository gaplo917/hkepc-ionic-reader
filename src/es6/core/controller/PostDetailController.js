/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import { FindMessageRequest } from '../model/requests'
import { Bridge, Channel } from '../bridge/index'

import { max } from 'lodash-es'
import * as Controllers from './index'
import { userFilterSchema } from '../schema'
import { PaginationPopoverDelegates } from '../delegates/pagination-popover-delegates'
import { IRLifecycleOwner } from './base/IRLifecycleOwner'
import { searchMultipleKeyword } from '../../utils/search'

export class PostDetailController extends IRLifecycleOwner {
  static get STATE() {
    return 'tab.topics-posts-detail'
  }

  static get NAME() {
    return 'PostDetailController'
  }

  static get CONFIG() {
    return {
      url: '/topics/:topicId/posts/:postId/page/:page?focus=',
      views: {
        main: {
          templateUrl: 'templates/post-detail.html',
          controller: PostDetailController.NAME,
          controllerAs: 'vm',
        },
      },
    }
  }

  constructor(
    $scope,
    $stateParams,
    $sce,
    $state,
    $location,
    MessageService,
    $ionicHistory,
    $ionicModal,
    $ionicPopover,
    ngToast,
    AuthService,
    $ionicScrollDelegate,
    LocalStorageService,
    apiService,
    rx,
    $timeout,
    $ionicPopup,
    $rootScope,
    $compile,
    $ionicActionSheet
  ) {
    super($scope)
    this.scope = $scope
    this.stateParams = $stateParams
    this.rx = rx
    this.messageService = MessageService
    this.state = $state
    this.location = $location
    this.sce = $sce
    this.ionicHistory = $ionicHistory
    this.ionicModal = $ionicModal
    this.ionicPopover = $ionicPopover
    this.ngToast = ngToast
    this.authService = AuthService
    this.ionicScrollDelegate = $ionicScrollDelegate.$getByHandle('post-detail')
    this.localStorageService = LocalStorageService
    this.apiService = apiService
    this.$timeout = $timeout
    this.compile = $compile
    this.isAutoLoadImage = true
    this.currentPage = undefined
    this.totalPageNum = undefined
    this.isLoggedIn = false
    this.ionicActionSheet = $ionicActionSheet

    // to control the post is end
    this.end = false

    this.messages = []

    this.paginationPopoverDelegate = PaginationPopoverDelegates(
      {
        $scope,
        $ionicPopover,
        $timeout,
        $ionicScrollDelegate,
      },
      {
        getCurrentPage: () => this.currentPage,
        getTotalPage: () => this.totalPageNum,
        getLocalMinPage: () => (this.messages[0] && this.messages[0].post.page) || 1,
        onJumpPage: ({ to }) => {
          if (to === this.currentPage - 1) {
            this.loadingPrevious = true
            this.loadMessages('previous', to)
          } else {
            this.reset()
            this.loadMessages('next', to)
          }
        },
      }
    )

    // Cleanup the popover when we're done with it!
    $scope
      .$eventToObservable('lastread')
      .observeOn(rx.Scheduler.async)
      .throttle(500)
      .doOnNext(([event, { page, id }]) => {
        console.log('received broadcast lastread', page, id)
        const { topicId, postId } = this
        const messageId = id.replace('message-', '')

        this.localStorageService.setObject(`${topicId}/${postId}/lastPosition`, {
          page,
          messageId,
        })
      })
      .map(([event, { page, id }]) => page)
      .distinctUntilChanged()
      .safeApply($scope, (page) => {
        this.currentPage = page
      })
      .subscribe()

    AuthService.isLoggedIn()
      .safeApply($scope, (isLoggedIn) => {
        this.isLoggedIn = isLoggedIn
      })
      .subscribe()
  }

  onViewEnter() {
    if (this.leaveView) {
      this.loadMessages('silent')
      this.leaveView = false
    }
  }

  onViewBeforeLeave() {
    this.leaveView = true
  }

  onViewDestroy() {
    this.paginationPopoverDelegate.remove()
    if (this.postTaskSubscription) this.postTaskSubscription.dispose()
  }

  onViewLoaded() {
    const { scope, rx, localStorageService } = this
    const { topicId, postId, focus: focusId, page } = this.stateParams
    this.topicId = topicId
    this.postId = postId
    this.focus = { id: focusId, fromLastPosition: false }
    this.currentPage = page

    // check to see if from a focus request
    if (!focusId) {
      // if not , jump to last reading page position
      rx.Observable.combineLatest(
        localStorageService.getObject(`${topicId}/${postId}/lastPosition`),
        localStorageService.get('loadImageMethod'),
        (lastPosition, loadImageMethod) => ({ lastPosition, loadImageMethod })
      )
        .safeApply(scope, ({ lastPosition, loadImageMethod }) => {
          console.log('loadImageMethod from db', loadImageMethod)

          const _lastPosition = lastPosition || {}
          const lastPage = _lastPosition.page || page
          const lastMessageId = _lastPosition.messageId || _lastPosition.postId // legacy field

          this.currentPage = lastPage
          this.focus = { id: lastMessageId, fromLastPosition: true }
          this.isAutoLoadImage = loadImageMethod !== 'block'

          this.loadMessages()
        })
        .subscribe()
    } else {
      localStorageService
        .get('loadImageMethod')
        .safeApply(scope, (loadImageMethod) => {
          console.log('loadImageMethod from db', loadImageMethod)
          this.isAutoLoadImage = loadImageMethod !== 'block'

          this.loadMessages()
        })
        .subscribe()
    }
  }

  updateFilterOpts() {
    const { rx, localStorageService } = this
    return rx.Observable.combineLatest(
      localStorageService.getObject('latestPostTopicFilters', []),
      localStorageService.getObject('latestReplyTopicFilters', []),
      localStorageService.getObject('hlKeywords', []),
      localStorageService.getObject('userFilter', userFilterSchema),
      localStorageService.get('filterMode', '1'),
      (latestPostTopicFilters, latestReplyTopicFilters, hlKeywords, userFilter, filterMode) => ({
        filterOpts: { latestPostTopicFilters, latestReplyTopicFilters, hlKeywords, userFilter },
        filterMode,
      })
    )
  }

  loadMore() {
    const { end, messages, totalPageNum } = this
    if (!end) {
      const existingPages = messages.filter((it) => it.type !== 'POST_PAGE_DIVIDER').map((it) => parseInt(it.post.page))

      // update the page count
      const maxPageNum = max(existingPages) || 0

      this.currentPage = maxPageNum < totalPageNum ? maxPageNum + 1 : maxPageNum

      this.loadMessages()
    }
  }

  forceLoadMore() {
    this.end = false
    this.loadMore()
  }

  /**
   *
   * @param style 'previous' or 'next'
   * @param page
   */
  loadMessages(style = 'next', page = this.currentPage) {
    const { refreshing } = this
    if (refreshing) return

    this.refreshing = true

    const {
      scope,
      rx,
      $timeout,
      postTaskSubscription,
      apiService,
      topicId,
      postId,
      reversePostOrder,
      filterOnlyAuthorId,
      isAutoLoadImage,
      messageService,
      messages,
      ionicScrollDelegate,
    } = this

    postTaskSubscription && postTaskSubscription.dispose()

    this.postTaskSubscription = rx.Observable.combineLatest(
      // api call
      apiService.postDetails({
        topicId,
        postId,
        page,
        orderType: reversePostOrder ? 1 : 0,
        filterOnlyAuthorId,
        isAutoLoadImage,
      }),
      // local db access
      this.updateFilterOpts(),
      (post, { filterOpts, filterMode }) => ({ post, filterOpts, filterMode })
    )
      .safeApply(scope, ({ post, filterOpts, filterMode }) => {
        const { userFilter, hlKeywords } = filterOpts
        const { userIds: userIdFilters, users: filteredUserInfos } = userFilter
        const { totalPageNum, isLock } = post

        post.messages.forEach((message) => {
          messageService.isLikedPost(message).subscribe((isLiked) => {
            message.liked = isLiked
          })

          const isMatchedFilter = userIdFilters.indexOf(message.author.uid) >= 0
          const remark = (isMatchedFilter && filteredUserInfos[message.author.uid].remark) || ''
          const remarkContent = remark ? `, ${remark}` : ''
          const filterReason =
            isMatchedFilter && `#${message.pos} (已隱藏｜原因：${message.author.name}的帖子${remarkContent})`

          // no focus must not from find message
          message.focused = message.id === this.focus.id && !this.focus.fromLastPosition
          message.isMatchedFilter = isMatchedFilter
          message.filterMode = filterMode
          message.filterReason = filterReason
        })

        if (page > totalPageNum) {
          page = totalPageNum

          // maybe have duplicate message
          const messageIds = messages.map((it) => it.id)

          const newMessages = post.messages.filter((msg) => messageIds.indexOf(msg.id) === -1)

          this.messages = this.highlightSearchText(messages.concat(newMessages), hlKeywords)
        } else {
          if (style === 'previous') {
            const messageIds = messages.map((it) => it.id)
            const newMessages = post.messages.filter((msg) => messageIds.indexOf(msg.id) === -1)

            const nextFocusId = `divider-previous-${page}`

            // add on the top
            messages.unshift({
              id: nextFocusId,
              post: { page: parseInt(page) + 1 },
              type: 'POST_PAGE_DIVIDER',
              content: '<i class="ion-android-arrow-up"></i> 上一頁加載完成 <i class="ion-ios-checkmark-outline" ></i>',
            })

            const merged = newMessages.concat(messages)

            merged.unshift({
              id: `divider-${page}`,
              post: { page },
              type: 'POST_PAGE_DIVIDER',
            })

            this.messages = this.highlightSearchText(merged, hlKeywords)

            // focus one the finish loading previous message
            this.focus = { id: nextFocusId, fromLastPosition: false }
          } else if (style === 'silent') {
            // slient update the content only
            for (let i = 0; i < messages.length; i++) {
              for (let j = 0; j < post.messages.length; j++) {
                if (messages[i].id === post.messages[j].id && messages[i].pstatus !== post.messages[j].pstatus) {
                  messages[i].content = post.messages[j].content
                }
              }
            }

            // maybe have new post, filter duplicate and concat new post to tail
            const messageIds = messages.map((it) => it.id)
            const newMessages = post.messages.filter((msg) => messageIds.indexOf(msg.id) === -1)

            if (newMessages.length > 0) {
              this.messages = this.highlightSearchText(messages.concat(newMessages), hlKeywords)
            }
          } else {
            // normal style (next)
            const messageIds = messages.map((it) => it.id)
            const hasThisPageDivider =
              messages.filter((it) => it.type === 'POST_PAGE_DIVIDER').filter((it) => parseInt(it.post.page) === page)
                .length > 0
            const newMessages = post.messages.filter((msg) => messageIds.indexOf(msg.id) === -1)
            const newPage = max(newMessages.map((it) => it.post.page)) || page

            if (newPage > page) {
              // only newPage will add page divider to prevent F5 loading duplicate the result
              messages.push({
                post: { page },
                type: 'POST_PAGE_DIVIDER',
              })
            } else if (!hasThisPageDivider) {
              // add page divider
              messages.push({
                post: { page },
                type: 'POST_PAGE_DIVIDER',
              })
            }
            this.messages = this.highlightSearchText(messages.concat(newMessages), hlKeywords)
          }
        }

        const { focus } = this
        const { id: focusId } = focus

        $timeout(() => {
          scope.$broadcast('scroll.infiniteScrollComplete')
        })

        this.loadingPrevious = false
        this.refreshing = false
        this.currentPage = page
        this.end = page >= totalPageNum
        this.post = post
        this.totalPageNum = totalPageNum
        this.isLock = this.isLoggedIn && isLock

        if (focusId) {
          $timeout(() => {
            console.debug('detected focus object', focus)
            const focusPosition = angular.element(document.querySelector(`#message-${focusId}`)).prop('offsetTop')
            ionicScrollDelegate.scrollTo(0, focusPosition - 24, false)
            this.focus = { id: undefined, fromLastPosition: false }
          })
        }
      })
      .subscribe()
  }

  like(message) {
    const { messageService } = this
    console.log('like', message)

    if (message.liked) {
      messageService.remove(message)
      message.liked = false
    } else {
      messageService.add(message)
      message.liked = true
    }
  }

  reset() {
    this.messages = []
    this.postTaskSubscription && this.postTaskSubscription.dispose()
    this.end = false
  }

  doRefresh() {
    this.reset()
    this.loadMessages()
  }

  onQuickReply(post) {
    const { scope, state, authService, postId, topicId, currentPage, ngToast } = this
    authService
      .isLoggedIn()
      .safeApply(scope, (isLoggedIn) => {
        if (isLoggedIn) {
          const reply = {
            id: null,
            postId,
            topicId,
            type: 1, // default to use none
          }

          state.go(Controllers.WriteReplyPostController.STATE, {
            topicId,
            postId,
            page: currentPage,
            post: JSON.stringify(post),
            reply: JSON.stringify(reply),
          })
        } else {
          ngToast.danger('<i class="ion-alert-circled"> 留言需要會員權限，請先登入！</i>')
        }
      })
      .subscribe()
  }

  onReply(message) {
    const { scope, state, authService, currentPage, ngToast, isLock, post } = this
    const { id: messageId } = message
    const { id: postId, topicId } = post
    authService
      .isLoggedIn()
      .safeApply(scope, (isLoggedIn) => {
        if (isLoggedIn) {
          if (isLock) {
            ngToast.danger('<i class="ion-alert-circled"> 主題已被封鎖，無法回覆！</i>')
            return
          }
          const reply = {
            id: messageId,
            postId,
            topicId,
            type: 3, // default to use quote
          }

          state.go(Controllers.WriteReplyPostController.STATE, {
            topicId,
            postId,
            page: currentPage,
            post: JSON.stringify(post),
            reply: JSON.stringify(reply),
          })
        } else {
          ngToast.danger('<i class="ion-alert-circled"> 留言需要會員權限，請先登入！</i>')
        }
      })
      .subscribe()
  }

  onReport(message) {
    const { scope, authService, ngToast, state, post } = this
    const { id: postId, topicId, title } = post
    const { id: messageId, author } = message
    authService
      .isLoggedIn()
      .safeApply(scope, (isLoggedIn) => {
        if (isLoggedIn) {
          state.go(Controllers.WriteReportController.STATE, {
            topicId,
            postId,
            messageId,
            meta: JSON.stringify({
              title,
              author,
            }),
          })
        } else {
          ngToast.danger('<i class="ion-alert-circled"> 舉報需要會員權限，請先登入！</i>')
        }
      })
      .subscribe()
  }

  onEdit(message) {
    const { state, currentPage } = this
    const { post } = message
    const { id: postId, topicId } = post
    state.go(Controllers.EditPostController.STATE, {
      topicId,
      postId,
      page: currentPage,
      message: JSON.stringify(message),
    })
  }

  findMessage(postId, messageId) {
    console.log(`findMessage(${postId},${messageId})`)
    this.scope.$emit(FindMessageRequest.NAME, new FindMessageRequest(postId, messageId))
  }

  onBack() {
    const { ionicHistory, state, topicId } = this
    if (ionicHistory.viewHistory().currentView.index !== 0) {
      ionicHistory.goBack()
    } else {
      ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true,
      })
      state.go(Controllers.PostListController.STATE, {
        topicId,
        page: 1,
      })
    }
  }

  relativeMomentize(dateStr) {
    const momentDate = moment(dateStr, 'YYYY-M-D hh:mm')

    if (momentDate.diff(new Date(), 'days') >= -3) {
      return momentDate.fromNow()
    } else {
      return dateStr
    }
  }

  onUserProfilePic(author) {
    const { scope, authService, state, ngToast } = this
    authService
      .isLoggedIn()
      .safeApply(scope, (isLoggedIn) => {
        if (isLoggedIn) {
          state.go(Controllers.UserProfileController.STATE, {
            author: JSON.stringify(author),
          })
        } else {
          ngToast.danger('<i class="ion-alert-circled"> 查看會員需要會員權根，請先登入！</i>')
        }
      })
      .subscribe()
  }

  onMore(message) {
    const { scope, apiService, ngToast } = this
    if (Bridge.isAvailable()) {
      Bridge.callHandler(
        Channel.actionSheet,
        {
          buttons: [
            '分享到 ...',
            '開啟 HKEPC 原始連結',
            `${this.reversePostOrder ? '關閉' : '開啟'}倒轉看帖`,
            `${this.filterOnlyAuthorId ? '關閉' : '開啟'}只看 ${message.author.name} 的帖`,
            '關注此主題的新回覆',
            '收藏此主題',
            `隱藏並封鎖 ${message.author.name}`,
            '舉報',
          ],
          titleText: '更多功能',
          cancelText: '取消',
        },
        (index) => {
          if (index === 0) {
            Bridge.callHandler(Channel.share, {
              url: HKEPC.forum.findMessage(message.post.id, message.id),
            })
          } else if (index === 1) {
            window.open(HKEPC.forum.findMessage(message.post.id, message.id), '_system', 'location=yes')
          } else if (index === 2) {
            this.reversePostOrder = !this.reversePostOrder
            if (this.reversePostOrder) this.ngToast.success('<i class="ion-ios-checkmark"> 已開啟倒轉看帖功能！</i>')
            else ngToast.success('<i class="ion-ios-checkmark"> 已關閉倒轉看帖功能！</i>')

            this.doRefresh()
          } else if (index === 3) {
            this.filterOnlyAuthorId = this.filterOnlyAuthorId === undefined ? message.author.uid : undefined
            if (this.filterOnlyAuthorId !== undefined)
              ngToast.success(`<i class="ion-ios-checkmark"> 只看 ${message.author.name} 的帖！</i>`)
            else ngToast.success(`<i class="ion-ios-checkmark"> 已關閉只看 ${message.author.name} 的帖！</i>`)

            this.doRefresh()
          } else if (index === 4) {
            apiService
              .subscribeNewReply(this.postId)
              .safeApply(scope, () => {
                ngToast.success('<i class="ion-ios-checkmark"> 成功關注此主題，你將能夠接收到新回覆的通知！</i>')
              })
              .subscribe()
          } else if (index === 5) {
            apiService
              .addFavPost(this.postId)
              .safeApply(scope, () => {
                ngToast.success('<i class="ion-ios-checkmark"> 成功收藏此主題！</i>')
              })
              .subscribe()
          } else if (index === 6) {
            // this feature is made for apple review team, sosad
            this.state.go(Controllers.CMUsersController.STATE, {
              prefill: JSON.stringify({
                id: message.author.uid,
                reason: '帖子內容問題',
              }),
            })
            message.isMatchedFilter = true
            message.filterMode = '1'
            message.filterReason = '(已隱藏｜原因：帖子內容問題)'
          } else if (index === 7) {
            this.onReport(message)
          }
        }
      )
    } else {
      this.ionicActionSheet.show({
        buttons: [
          { text: '開啟 HKEPC 原始連結' },
          { text: `${this.reversePostOrder ? '關閉' : '開啟'}倒轉看帖` },
          { text: `${this.filterOnlyAuthorId ? '關閉' : '開啟'}只看 ${message.author.name} 的帖` },
          { text: '關注此主題的新回覆' },
          { text: '收藏此主題' },
          { text: '舉報' },
        ],
        titleText: '更多功能',
        cancelText: '取消',
        cancel: () => {
          // add cancel code..
          this.ionicActionSheet.hide()
          return true
        },
        buttonClicked: (index) => {
          if (index === 0) {
            window.open(HKEPC.forum.findMessage(message.post.id, message.id))
          } else if (index === 1) {
            this.reversePostOrder = !this.reversePostOrder
            if (this.reversePostOrder) this.ngToast.success('<i class="ion-ios-checkmark"> 已開啟倒轉看帖功能！</i>')
            else this.ngToast.success('<i class="ion-ios-checkmark"> 已關閉倒轉看帖功能！</i>')

            this.doRefresh()
          } else if (index === 2) {
            this.filterOnlyAuthorId = this.filterOnlyAuthorId === undefined ? message.author.uid : undefined
            if (this.filterOnlyAuthorId !== undefined)
              this.ngToast.success(`<i class="ion-ios-checkmark"> 只看 ${message.author.name} 的帖！</i>`)
            else this.ngToast.success(`<i class="ion-ios-checkmark"> 已關閉只看 ${message.author.name} 的帖！</i>`)

            this.doRefresh()
          } else if (index === 3) {
            this.apiService
              .subscribeNewReply(this.postId)
              .safeApply(this.scope, () => {
                this.ngToast.success('<i class="ion-ios-checkmark"> 成功關注此主題，你將能夠接收到新回覆的通知！</i>')
              })
              .subscribe()
          } else if (index === 4) {
            this.apiService
              .addFavPost(this.postId)
              .safeApply(this.scope, () => {
                this.ngToast.success('<i class="ion-ios-checkmark"> 成功收藏此主題！</i>')
              })
              .subscribe()
          } else if (index === 5) {
            this.onReport(message)
          }
          return true
        },
        destructiveButtonClicked: (index) => {
          return true
        },
      })
    }
  }

  getTimes(n) {
    return new Array(parseInt(n))
  }

  loadLazyImage(uid, imageSrc) {
    const { scope, compile } = this
    const image = document.getElementById(uid)
    const $element = angular.element(image)

    if (image.getAttribute('src') === imageSrc) {
      window.open(imageSrc, '_system', 'location=yes')
    } else {
      // hide the image
      image.setAttribute('style', 'display: none')
      const loader = compile(`
          <div class='image-loader-container'>
              <ion-spinner class='image-loader' icon='${image.getAttribute('image-lazy-loader')}'/>
          </div>
      `)(scope)

      $element.after(loader)

      const bgImg = new Image()

      bgImg.onload = function () {
        loader.remove()
        image.setAttribute('src', imageSrc)
        image.removeAttribute('style')
      }
      bgImg.onerror = function () {
        loader.remove()
        image.removeAttribute('style')
        // reproduce the error state
        image.onerror()
      }

      bgImg.src = imageSrc
    }
  }

  openImage(uid, imageSrc) {
    window.open(imageSrc, '_system', 'location=yes')
  }

  highlightSearchText(messages, hlKeywords) {
    return messages.map((message) => {
      if (message.content) {
        const { hlContent } = searchMultipleKeyword(hlKeywords, message.content)
        return {
          ...message,
          hlContent,
        }
      }
      return {
        ...message,
        hlContent: message.content,
      }
    })
  }
}
