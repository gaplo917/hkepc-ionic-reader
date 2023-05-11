/**
 * Created by Gaplo917 on 11/1/2016.
 */
import { PushHistoryRequest } from '../model/requests'
import * as Controllers from './index'
import { userFilterSchema } from '../schema'
import { PaginationPopoverDelegates } from '../delegates'
import { searchMultipleKeyword } from '../../utils/search'

//  t = current time
// b = start value
// c = change in value
// d = duration
function easeInOutQuad (t, b, c, d) {
  t /= d / 2
  if (t < 1) return c / 2 * t * t + b
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

export class PostListController {
  static get STATE () { return 'tab.topics-posts' }

  static get NAME () { return 'PostListController' }

  static get CONFIG () {
    return {
      url: '/topics/:topicId/page/:page?searchId=&searchText=&searchResp=',
      views: {
        main: {
          templateUrl: 'templates/post-list.html',
          controller: PostListController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $state, $stateParams, $location, $ionicScrollDelegate, $ionicHistory, $ionicPopover, LocalStorageService, $ionicModal, ngToast, $q, apiService, rx, $timeout, AuthService) {
    this.scope = $scope
    this.state = $state
    this.location = $location
    this.ionicScrollDelegate = $ionicScrollDelegate
    this.ionicHistory = $ionicHistory
    this.LocalStorageService = LocalStorageService
    this.ngToast = ngToast
    this.q = $q
    this.apiService = apiService
    this.rx = rx
    this.$ionicModal = $ionicModal
    this.$ionicPopover = $ionicPopover
    this.$timeout = $timeout
    this.authService = AuthService

    this.topicId = $stateParams.topicId
    this.searchId = $stateParams.searchId
    this.searchText = $stateParams.searchText
    // passed from SearchController
    this.searchResp = $stateParams.searchResp ? JSON.parse($stateParams.searchResp) : undefined

    this.page = $stateParams.page
    this.categories = []
    this.currentPageNum = this.page - 1
    this.subTopicList = []
    this.posts = null
    this.hasMoreData = true
    this.filter = undefined
    this.order = undefined

    this.topicUiReady = false

    this.paginationPopoverDelegate = PaginationPopoverDelegates({
      $scope,
      $ionicPopover,
      $timeout,
      $ionicScrollDelegate
    }, {
      getCurrentPage: () => this.currentPageNum,
      getTotalPage: () => this.totalPageNum,
      getLocalMinPage: () => (this.posts !== null && this.posts[0] && this.posts[0].pageNum) || 1,
      onJumpPage: ({ to }) => {
        this.reset()
        this.currentPageNum = to
        this.loadPosts(to)
      }
    })

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/modals/filter-order.html').then((popover) => {
      this.filterOrderPopover = popover
      this.filterOrderPopover.scope.vm = {}
      const vm = this.filterOrderPopover.scope.vm
      vm.hide = () => {
        popover.hide()
      }
      vm.doRefresh = ({ order, filter }) => {
        this.order = order
        this.filter = filter
        this.doRefresh()
      }
    })

    // Cleanup the popover when we're done with it!
    $scope.$on('$destroy', () => {
      this.filterOrderPopover && this.filterOrderPopover.remove()
      this.paginationPopoverDelegate.remove()
    })

    $scope.$eventToObservable('lastread')
      .throttle(300)
      .safeApply($scope, ([event, { page, id }]) => {
        console.log('received broadcast lastread', page, id)
        this.currentPageNum = page
      })
      .subscribe()

    // $scope.$on('$ionicView.enter', (e) => {
    //
    // })
    //
    // $scope.$on('$ionicView.unloaded', (e) => {
    // })

    this.LocalStorageService.get('showSticky', true).safeApply($scope, data => {
      console.log('showSticky', data)
      this.showSticky = String(data) === 'true'
    }).subscribe()

    this.loadMore()
  }

  /**
   * @return {Observable<{filterOpts: {}, filterMode}>}
   */
  getFilterOptsObs () {
    return this.rx.Observable.combineLatest(
      this.LocalStorageService.getObject('latestPostTopicFilters', []),
      this.LocalStorageService.getObject('latestReplyTopicFilters', []),
      this.LocalStorageService.getObject('hlKeywords', []),
      this.LocalStorageService.getObject('userFilter', userFilterSchema),
      this.LocalStorageService.get('filterMode', '1'),
      (latestPostTopicFilters, latestReplyTopicFilters, hlKeywords, userFilter, filterMode) => ({
        filterOpts: { latestPostTopicFilters, latestReplyTopicFilters, hlKeywords, userFilter },
        filterMode
      })
    )
  }

  loadPosts (page) {
    if (this.searchResp) {
      this.getFilterOptsObs()
        .safeApply(this.scope, ({ filterOpts, filterMode }) => {
          this.renderPostListResponse(this.searchResp, filterOpts, filterMode)
          this.searchResp = undefined
        }).subscribe()
    } else {
      this.rx.Observable.combineLatest(
        this.apiService.postListPage({
          topicId: this.topicId,
          pageNum: page,
          filter: this.filter,
          order: this.order,
          searchId: this.searchId
        }),
        this.getFilterOptsObs(),
        (resp, { filterOpts, filterMode }) => ({ resp, filterOpts, filterMode })
      )
        .safeApply(this.scope, ({ resp, filterOpts, filterMode }) => {
          this.renderPostListResponse(resp, filterOpts, filterMode)
        }).subscribe()
    }
  }

  loadMore () {
    if (this.hasMoreData) {
      const nextPage = parseInt(this.currentPageNum) + 1
      this.loadPosts(nextPage)
    }
  }

  renderPostListResponse (resp, filterOpts, filterMode) {
    const { userFilter, latestPostTopicFilters, latestReplyTopicFilters, hlKeywords } = filterOpts
    const { userIds: userIdsFilter, users: filteredUserInfos } = userFilter
    const { searchId, totalPageNum, categories, posts: nPosts, topicName, subTopicList, pageNum } = resp
    const { topicId: topicTypeOrId } = this
    const existingPostIds = (this.posts || []).map(it => it.id)
    const deduplicatedPosts = nPosts.filter(it => existingPostIds.indexOf(it.id) === -1)

    this.searchId = searchId
    // only extract the number
    this.totalPageNum = totalPageNum

    this.categories = categories

    // better UX to highlight the searchText
    const posts = topicTypeOrId === 'search'
      ? (this.posts || []).concat(this.highlightSearchText(deduplicatedPosts, this.searchText))
      : (this.posts || []).concat(this.highlightSearchText(deduplicatedPosts, hlKeywords.join(' ')))

    this.posts = posts.map(it => {
      const { topicId: postTopicId, author, tag } = it
      const { id: authorId, name: authorName } = author

      const hasFilteredAuthor = userIdsFilter.indexOf(authorId) >= 0
      const hasFilteredTopic = topicTypeOrId === 'latestPost'
        ? latestPostTopicFilters.indexOf(postTopicId) >= 0
        : topicTypeOrId === 'latest'
          ? latestReplyTopicFilters.indexOf(postTopicId) >= 0
          : false
      const isMatchedFilter = hasFilteredAuthor || hasFilteredTopic

      const remark = (hasFilteredAuthor && filteredUserInfos[authorId].remark) || ''
      const remarkContent = remark ? `, ${remark}` : ''

      const filterReason = hasFilteredAuthor
        ? `(已隱藏｜原因：${authorName}的帖子${remarkContent})`
        : hasFilteredTopic
          ? `(已隱藏｜原因：${tag}版塊內的帖子)`
          : ''

      return {
        ...it,
        isMatchedFilter,
        filterMode,
        filterReason
      }
    })
      .filter(it => !(it.isMatchedFilter && String(it.filterMode) === '2'))

    console.log('filtered postList', this.posts)

    this.currentPageNum = parseInt(pageNum) + 1

    const renderTopicName = () => {
      switch (topicTypeOrId) {
        case 'search': return `${topicName} ${this.searchText}`
        case 'latest': return '最新帖子'
        case 'latestPost': return '最新發佈'
        default: return topicName
      }
    }

    // use exiting list if there is
    this.subTopicList = this.subTopicList.length === 0
      ? [{
          id: topicTypeOrId,
          name: renderTopicName()
        }, ...subTopicList]
      : this.subTopicList

    if (!this.topic) {
      this.topic = this.subTopicList[0]
    }

    // FIXME: any better way?
    // have to guarantee the view is positioned already before showing
    if (this.subTopicList.length > 1 && !this.topicUiReady) {
      requestAnimationFrame(() => {
        this.$timeout(() => {
          this.centerSelectedTopic(this.topic, false)
          this.topicUiReady = true
        })
      })
    }

    this.hasMoreData = this.currentPageNum <= this.totalPageNum

    this.scope.$broadcast('scroll.infiniteScrollComplete')
  }

  reset () {
    this.currentPageNum = 1
    this.posts = null
    this.searchId = null
  }

  doRefresh () {
    this.reset()
    if (this.filter) {
      const category = this.categories.find(c => c.id === this.filter)
      if (category) {
        requestAnimationFrame(() => {
          this.$timeout(() => {
            this.ngToast.success(`<i class="ion-ios-checkmark-outline"> 正在使用分類 - #${category.name} </i>`)
          })
        })
      }
    }
    this.loadPosts(this.currentPageNum)
  }

  centerSelectedTopic (subTopic, animated) {
    const getCurrentTime = () => {
      if (window.performance && window.performance.now) {
        return performance.now()
      } else if (Date.now) {
        return Date.now()
      } else {
        return new Date().getTime()
      }
    }
    const scrollLeftTo = (element, to, duration) => {
      const start = element.scrollLeft
      const change = to - start
      const startTime = getCurrentTime()

      const animateScroll = () => {
        const deltaT = getCurrentTime() - startTime
        if (deltaT < duration) {
          element.scrollLeft = easeInOutQuad(deltaT, start, change, duration)
          requestAnimationFrame(animateScroll)
        }
      }
      animateScroll()
    }

    const container = document.getElementById('topics')
    const elm = document.getElementById('subtopic-' + subTopic.id)
    const to = elm.offsetLeft - container.offsetWidth / 2 + elm.offsetWidth / 2
    if (animated) {
      scrollLeftTo(container, to, 250)
    } else {
      container.scrollLeft = to
    }
  }

  goToSubTopic (index, subTopic) {
    this.centerSelectedTopic(subTopic, true)

    // swap the item in the list
    // this.subTopicList[index] = this.topic
    this.topic = subTopic

    // override the topic id
    this.topicId = subTopic.id

    this.doRefresh()
  }

  saveShowSticky (bool) {
    this.LocalStorageService.set('showSticky', bool)
  }

  doNewPost (topic) {
    const { scope, state, authService, ngToast } = this

    authService.isLoggedIn().safeApply(scope, isLoggedIn => {
      if (isLoggedIn) {
        state.go(Controllers.WriteNewPostController.STATE, {
          topicId: this.topicId,
          topic: JSON.stringify(topic),
          categories: JSON.stringify(this.categories)
        })
      } else {
        ngToast.danger('<i class="ion-alert-circled"> 發佈新主題需要會員權限，請先登入！</i>')
      }
    }).subscribe()
  }

  doFilterOrder ($event) {
    const vm = this.filterOrderPopover.scope.vm
    vm.categories = this.categories
    vm.filter = this.filter
    vm.order = this.order
    this.filterOrderPopover.show($event)
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true

      })
      this.state.go(Controllers.TopicListController.STATE)
    }
  }

  postInAppUrl (post) {
    return post.isMatchedFilter ? '' : `/tab/topics/${post.topicId}/posts/${post.id}/page/1`
  }

  onGoToPost (post) {
    post.isMatchedFilter = false
    this.scope.$emit(PushHistoryRequest.NAME, new PushHistoryRequest(post))
  }

  hasStickyPost (posts) {
    return posts != null && posts && posts.filter(post => post.isSticky).length > 0
  }

  relativeMomentize (dateStr) {
    if (moment(dateStr, 'YYYY-M-D hh:mm').diff(new Date(), 'days') >= -3) {
      return moment(dateStr, 'YYYY-M-D hh:mm').fromNow()
    } else {
      return dateStr
    }
  }

  highlightSearchText (posts, searchText) {
    return posts.map(post => {
      // map to a search result

      const { hlContent } = searchMultipleKeyword(searchText.split(' '), post.name)
      return {
        ...post,
        hlContent
      }
    })
  }
}
