/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as Controllers from './index'
import { isAndroidNative, isiOSNative } from '../bridge/index'
import swal from 'sweetalert2'

export class TopicListController {
  static get STATE () { return 'tab.topics' }

  static get NAME () { return 'TopicListController' }

  static get CONFIG () {
    return {
      url: '/topics',
      views: {
        main: {
          templateUrl: 'templates/tab-topics.html',
          controller: TopicListController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, LocalStorageService, AuthService, ngToast, apiService, rx, observeOnScope, $q, $state) {
    this.scope = $scope
    this.rx = rx
    this.localStorageService = LocalStorageService
    this.authService = AuthService
    this.topics = []
    this.topicRankMap = new Map()
    this.rankedTopics = []
    this.apiService = apiService
    this.firstLogin = true
    this.q = $q
    this.state = $state
    this.ngToast = ngToast
    this.editMode = false
    this.isLoggedIn = false

    observeOnScope($scope, 'vm.topics')
      .delay(1000) // delay for saving topics
      .subscribe(({ oldValue, newValue }) => {
        if (newValue.length > 0) {
          this.localStorageService.setObject('topics', newValue)
        }
      })

    $scope.$on('$ionicView.loaded', (e) => {
      this.rx.Observable.combineLatest(
        this.localStorageService.getObject('topic-rank-map', []),
        this.localStorageService.getObject('topics', []),
        (topicRankMapObj, topics) => ({ topicRankMapObj, topics })
      )
        .flatMap(({ topicRankMapObj, topics }) => {
          if (topics && topics.length > 0) {
            console.log('[TopicListController]', 'using cache')
          }
          return topics && topics.length > 0
            ? this.rx.Observable.just({ topicRankMapObj, topics })
            : this.apiService.topicList()
              .do(() => this.localStorageService.set('topics-cache-timestamp', moment().unix()))
              .map((topics) => ({ topicRankMapObj, topics }))
        })
        .safeApply($scope, ({ topicRankMapObj, topics }) => {
          this.topicRankMap = new Map(topicRankMapObj)
          this.updateTopics(topics)
        }).subscribe()
    })

    $scope.$on('$ionicView.enter', (e) => {
      this.authService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
        if (isLoggedIn !== this.isLoggedIn) {
          // auto refresh when state changes
          this.loadList()
        }
        this.isLoggedIn = isLoggedIn
      }).subscribe()

      this.authService.getUsername().safeApply(this.scope, username => {
        this.username = username
      }).subscribe()

      this.localStorageService.get('topics-cache-timestamp')
        .safeApply($scope, data => {
          if (data) {
            this.cacheTimestamp = moment(data * 1000).fromNow()
            console.log(this.cacheTimestamp)
          }
        }).subscribe()
    })
  }

  reset () {
    // reset the model
    // this.topics = []
    this.topicsSubscription && this.topicsSubscription.dispose()
  }

  loadList () {
    this.refreshing = true

    this.topicsSubscription = this.apiService.topicList()
      .safeApply(this.scope, topics => {
        this.cacheTimestamp = moment().fromNow()
        this.refreshing = false

        // save to local
        this.localStorageService.set('topics-cache-timestamp', moment().unix())

        this.updateTopics(topics)
      })
      .subscribe()
  }

  doRefresh () {
    // refresh to load list
    this.authService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
      this.isLoggedIn = isLoggedIn
    }).subscribe()

    this.reset()

    this.loadList()
  }

  changeEditMode () {
    this.editMode = !this.editMode

    this.updateRankedTopics()
  }

  updateRankedTopics () {
    this.rankedTopics = [...this.topics].filter(t => {
      const rank = this.topicRankMap.get(t.id)
      return rank && rank > 0
    })
      .map(t => {
        t.rank = this.topicRankMap.get(t.id)
        return t
      })

    this.rankedTopics.sort((t1, t2) => t2.rank - t1.rank)
  }

  increaseRank (topic) {
    const topicRank = this.topicRankMap.get(topic.id)

    if (topicRank) {
      this.topicRankMap.set(topic.id, topicRank + 1)
    } else {
      this.topicRankMap.set(topic.id, 1)
    }

    this.saveTopicRankMap()
  }

  decreaseRank (topic) {
    const topicRank = this.topicRankMap.get(topic.id)

    if (topicRank > 0) {
      this.topicRankMap.set(topic.id, topicRank - 1)
    } else {
      this.topicRankMap.set(topic.id, 0)
    }

    this.saveTopicRankMap()
  }

  saveTopicRankMap () {
    this.localStorageService.setObject('topic-rank-map', [...this.topicRankMap])
  }

  canShowGroupNameIniOSReview (groupName) {
    return !ionic.Platform.isIOS() || groupName !== 'Mobile Phone'
  }

  canShowIniOSReview (topicId) {
    const blackList = [121, 123, 202]
    return !ionic.Platform.isIOS() || (blackList.indexOf(parseInt(topicId)) < 0 || (this.isLoggedIn && this.username !== 'logary917'))
  }

  canShowSectionInIOSReview (topicId) {
    const blackList = [171, 168, 170, 44, 277, 202, -1] // -1 is IR Zone
    return !ionic.Platform.isIOS() || (blackList.indexOf(parseInt(topicId)) < 0 || (this.isLoggedIn && this.username !== 'logary917'))
  }

  myTopicTutorial () {
    swal({
      animation: false,
      html: `這個是範例版塊。你要點擊 HKEPC 的版塊右邊的<span style="color: #FF6D00; font-size:24px; font-weight: 500"> +1 </span>才能提升喜好程度！`,
      showCancelButton: false
    })
  }

  encourageTopicTutorial () {
    swal({
      animation: false,
      html: `這個是範例版塊。你要點擊右下角 <i class="ion-ios-bookmarks-outline"></i> ，然後開始編緝你的論壇版塊喜好程度！`,
      showCancelButton: false
    })
  }

  updateTopics (topics) {
    this.topics = topics

    topics.forEach(t => {
      if (!this.topicRankMap[t.id]) {
        this.topicRankMap[t.id] = 0
      }
    })

    this.updateRankedTopics()
  }

  onIRSection () {
    if (isiOSNative()) {
      this.state.go(Controllers.PostDetailController.STATE, {
        topicId: 202,
        postId: 2295363,
        page: 1
      })
    } else if (isAndroidNative()) {
      this.state.go(Controllers.PostDetailController.STATE, {
        topicId: 180,
        postId: 2266086,
        page: 1
      })
    } else {
      this.state.go(Controllers.IRListController.STATE)
    }
  }
}
