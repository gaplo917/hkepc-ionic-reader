/**
 * Created by Gaplo917 on 6/2/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import { FindMessageRequest } from '../model/requests'
import { searchMultipleKeyword } from '../../utils/search'

export class LikesController {
  static get STATE () { return 'tab.likes' }

  static get NAME () { return 'LikesController' }

  static get CONFIG () {
    return {
      url: '/likes',
      views: {
        main: {
          templateUrl: 'templates/tab-likes.html',
          controller: LikesController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, AuthService, $state, ngToast, MessageService, $sanitize, $ionicActionSheet) {
    this.scope = $scope
    this.ngToast = ngToast
    this.pageSize = 5
    this.sanitize = $sanitize
    this.end = false
    this.page = 1
    this.ionicActionSheet = $ionicActionSheet
    this.messageService = MessageService
    this.searchText = ''

    $scope.$on('$ionicView.loaded', (e) => {
      // get the whole list from db
      this.doRefresh()
    })
  }

  doRefresh () {
    this.messageService.getAllLikedPost().safeApply(this.scope, posts => {
      this.wholeMessages = Object.assign([], posts).reverse()
      this.messages = this.wholeMessages.slice(0, this.pageSize)
      this.totalPageNum = Math.ceil(this.wholeMessages.length / this.pageSize)

      // search with empty first
      this.highlightSearchText()
    }).subscribe()
  }

  loadMore () {
    console.log('loadmore', this.totalPageNum)
    if (this.hasMoreData()) {
      const nextPage = parseInt(this.page) + 1
      if (nextPage <= this.totalPageNum) {
        const n = Math.min(nextPage * this.pageSize, this.wholeMessages.length)

        this.messages = this.wholeMessages.slice(0, n)

        // update the page count
        this.page = nextPage
      } else {
        // set a flag for end
        this.end = true
      }

      this.scope.$broadcast('scroll.infiniteScrollComplete')
    }
  }

  hasMoreData () {
    return !this.end && !this.searchText
  }

  highlightSearchText () {
    const result = this.wholeMessages.map(msg => {
      // map to a search result
      const keywordArr = this.searchText.split(' ')
      const { matches: titleMatches, hlContent: hlTitle } = searchMultipleKeyword(keywordArr, msg.post.title)
      const { matches: keywordMatches, hlContent: hlBody } = searchMultipleKeyword(keywordArr, msg.content)

      return {
        ...msg,
        matches: titleMatches + keywordMatches,
        hlContent: { title: hlTitle, body: hlBody }
      }
    }).filter(e => e.matches > 0) // filter no matches
      .sort((e1, e2) => e2.matches - e1.matches) // sort by matches

    if (!this.searchText) {
      this.messages = this.wholeMessages.slice(0, this.pageSize)
        .map(it => ({
          ...it,
          hlContent: {
            title: it.post.title,
            body: it.content
          }
        }))
    } else {
      this.messages = result
    }
  }

  findMessage (postId, messageId) {
    this.scope.$emit(FindMessageRequest.NAME, new FindMessageRequest(postId, messageId))
  }

  onMore (message) {
    // Show the action sheet
    this.ionicActionSheet.show({
      buttons: [
        { text: '開啟' },
        { text: '開啟 HKEPC 原始連結' }
      ],
      titleText: '分享連結',
      destructiveText: '從我的最愛移除',
      cancelText: '取消',
      cancel: () => {
        // add cancel code..
        return true
      },
      buttonClicked: (index) => {
        if (index === 0) {
          window.location.href = `/tab/topics/${message.post.topicId}/posts/${message.post.id}/page/${message.post.page}`
        } else {
          window.open(HKEPC.forum.findMessage(message.post.id, message.id))
        }
        return true
      },
      destructiveButtonClicked: (index) => {
        this.messageService.remove(message)
        this.messages = this.messages.filter(m => m.id !== message.id)
        return true
      }
    })
  }

  loadLazyImage (uid, imageSrc) {
    const image = document.getElementById(uid)
    if (image.getAttribute('src') === imageSrc) {
      window.open(imageSrc, '_system', 'location=yes')
    } else {
      image.setAttribute('src', imageSrc)
    }
  }

  openImage (uid, imageSrc) {
    window.open(imageSrc, '_system', 'location=yes')
  }
}
