/**
 * Created by Gaplo917 on 11/1/2016.
 */
import { PushHistoryRequest } from '../model/requests'
import * as Controllers from './index'
import { userFilterSchema } from '../schema'
import { PaginationPopoverDelegates } from '../delegates'

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

  constructor ($scope, $state, $stateParams, $location, $ionicScrollDelegate, $ionicHistory, $ionicPopover, LocalStorageService, $ionicModal, ngToast, $q, apiService, rx, $timeout) {
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

    this.topicId = $stateParams.topicId
    this.searchId = $stateParams.searchId
    this.searchText = $stateParams.searchText
    // passed from SearchController
    this.searchResp = $stateParams.searchResp ? JSON.parse($stateParams.searchResp) : undefined

    this.page = $stateParams.page
    this.categories = []
    this.currentPageNum = this.page - 1
    this.subTopicList = []
    this.posts = []
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
      getLocalMinPage: () => (this.posts[0] && this.posts[0].pageNum) || 1,
      onJumpPage: ({ to }) => {
        this.reset()
        this.currentPageNum = to
        this.loadPosts(to)
      }
    })

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/modals/filter-order.html', {
      scope: $scope
    }).then((popover) => {
      this.filterOrderPopover = popover
    })

    // Cleanup the popover when we're done with it!
    $scope.$on('$destroy', () => {
      this.filterOrderPopover && this.filterOrderPopover.remove()
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
      this.LocalStorageService.getObject('userFilter', userFilterSchema).map(it => it.userIds),
      this.LocalStorageService.get('filterMode', '1'),
      (latestPostTopicFilters, latestReplyTopicFilters, hlKeywords, userIds, filterMode) => ({
        filterOpts: { latestPostTopicFilters, latestReplyTopicFilters, hlKeywords, userIds },
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
    const { userIds, latestPostTopicFilters, latestReplyTopicFilters, hlKeywords } = filterOpts

    this.searchId = resp.searchId
    // only extract the number
    this.totalPageNum = resp.totalPageNum

    this.categories = resp.categories

    // better UX to highlight the searchText
    this.posts = this.topicId === 'search'
      ? this.posts.concat(this.highlightSearchText(resp.posts, this.searchText))
      : this.posts.concat(this.highlightSearchText(resp.posts, hlKeywords.join(' ')))

    this.posts = this.posts.map(it => {
      const { topicId: postTopicId, author, tag } = it
      const { id: authorId, name: authorName } = author

      const hasFilteredAuthor = userIds.indexOf(authorId) >= 0
      const hasFilteredTopic = this.topicId === 'latestPost'
        ? latestPostTopicFilters.indexOf(postTopicId) >= 0
        : this.topicId === 'latest'
          ? latestReplyTopicFilters.indexOf(postTopicId) >= 0
          : false
      const isMatchedFilter = hasFilteredAuthor || hasFilteredTopic

      const filterReason = hasFilteredAuthor
        ? `(已隱藏｜原因：${authorName} 的帖子)`
        : hasFilteredTopic
          ? `(已隱藏｜原因：${tag}版塊內的帖子)`
          : ``

      return {
        ...it,
        isMatchedFilter,
        filterMode,
        filterReason
      }
    })

    console.log('filtered postList', this.posts)

    this.currentPageNum = parseInt(this.currentPageNum) + 1

    const renderTopicName = () => {
      switch (this.topicId) {
        case 'search': return `${resp.topicName} ${this.searchText}`
        case 'latest': return '最新帖子'
        case 'latestPost': return '最新發佈'
        default: return resp.topicName
      }
    }

    // use exiting list if there is
    this.subTopicList = this.subTopicList.length === 0
      ? [{
        id: this.topicId,
        name: renderTopicName()
      }, ...resp.subTopicList]
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
    this.posts = []
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
    const scrollLeftTo = (element, to, duration) => {
      const start = element.scrollLeft
      const change = to - start
      let currentTime = 0
      const increment = 16

      const animateScroll = () => {
        currentTime += increment
        element.scrollLeft = easeInOutQuad(currentTime, start, change, duration)
        if (currentTime < duration) {
          this.$timeout(animateScroll, increment)
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
    this.state.go(Controllers.WriteNewPostController.STATE, {
      topicId: this.topicId,
      topic: JSON.stringify(topic),
      categories: JSON.stringify(this.categories)
    })
  }

  doFilterOrder ($event) {
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
    return post.isMatchedFilter ? '' : `#/tab/topics/${post.topicId}/posts/${post.id}/page/1`
  }

  onGoToPost (post) {
    post.isMatchedFilter = false
    this.scope.$emit(PushHistoryRequest.NAME, new PushHistoryRequest(post))
  }

  hasStickyPost (posts) {
    return posts && posts.filter(post => post.isSticky).length > 0
  }

  relativeMomentize (dateStr) {
    if (moment(dateStr, 'YYYY-M-D hh:mm').diff(new Date(), 'days') >= -3) {
      return moment(dateStr, 'YYYY-M-D hh:mm').fromNow()
    } else {
      return dateStr
    }
  }

  /**
   *  Modified version from LikesController
   */
  highlightSearchText (posts, searchText) {
    const searchKeywordIndex = (str, keyword, indexArr = []) => {
      const lastIndexPos = indexArr.length === 0 ? 0 : indexArr[indexArr.length - 1] + 1
      const index = str.indexOf(keyword, lastIndexPos)
      if (index === -1 || !str || !keyword) {
        return indexArr
      } else {
        return searchKeywordIndex(str, keyword, indexArr.concat([index]))
      }
    }

    const searchBraceIndex = (str, indexArr = []) => {
      return (searchKeywordIndex(str, '<').concat(searchKeywordIndex(str, '>'))).sort((a, b) => a - b)
    }

    const isIndexInBrace = (content, bracePos, index) => {
      switch (bracePos.length) {
        case 0 :
          return false
        case 1 :
          return false
        default :
          return (
            content[bracePos[0]] === '<' &&
              content[bracePos[1]] === '>' &&
              index > bracePos[0] &&
              index < bracePos[1]
          ) || isIndexInBrace(content, bracePos.slice(2), index)
      }
    }

    const breakContent = (content, len, validIndexs, prevPos = 0, splits = []) => {
      switch (validIndexs.length) {
        case 0:
          // concat the rest of the content
          return splits.concat([
            content.slice(Math.min(prevPos, content.length))
          ])
        default:
          const contentIndex = validIndexs[0]
          // break down into two part
          const s = splits.concat([
            content.slice(prevPos, contentIndex),
            content.slice(contentIndex, contentIndex + len)
          ])
          return breakContent(content, len, validIndexs.slice(1), contentIndex + len, s)
      }
    }

    const mergeAndInjectHightLightContent = (splits, hlContent = '') => {
      switch (splits.length) {
        case 0 :
          return hlContent
        case 1 :
          return `${hlContent}${splits[0]}`
        default :
          const merged = `${hlContent}${splits[0]}<span class="search-highlight">${splits[1]}</span>`
          return mergeAndInjectHightLightContent(splits.slice(2), merged)
      }
    }

    const searchAndInjectHighlightBetweenKeyword = (content, keyword) => {
      // find all brace for identify the html tag
      const bracePos = searchBraceIndex(content)

      // search the keyword position
      const validIndex = searchKeywordIndex(content.toLowerCase(), keyword.toLowerCase())
        .filter(index => !isIndexInBrace(content, bracePos, index))

      return {
        matches: validIndex.length,
        hlContent: mergeAndInjectHightLightContent(breakContent(content, keyword.length, validIndex))
      }
    }

    const searchMultipleKeyword = (keywordArr, post, result = { matches: 0 }) => {
      switch (keywordArr.length) {
        case 0 :
          return result
        default :
          const hlm = Object.assign({}, post)

          const title = angular.element('<div/>').html(hlm.name).html()
          const keyword = keywordArr[0]

          const searchResult = {
            name: searchAndInjectHighlightBetweenKeyword(title, keyword)
          }

          // set the name
          hlm.name = searchResult.name.hlContent

          result = {
            matches: result.matches + searchResult.name.matches,
            post: hlm
          }

          return searchMultipleKeyword(keywordArr.slice(1), hlm, result)
      }
    }

    return posts.map(post => {
      // map to a search result
      return searchMultipleKeyword(searchText.split(' '), post)
    }).map(e => e.post)
  }
}
