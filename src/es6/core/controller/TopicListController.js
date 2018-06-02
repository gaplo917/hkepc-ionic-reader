/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as Controllers from "./index"
import {
  isiOSNative,
  isAndroidNative,
} from "../bridge/index";
import swal from 'sweetalert2'

export class TopicListController {
  static get STATE() { return 'tab.topics'}
  static get NAME() { return 'TopicListController'}
  static get CONFIG() { return {
    url: '/topics',
    views: {
      'main': {
        templateUrl: 'templates/tab-topics.html',
        controller: TopicListController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope,LocalStorageService,AuthService,ngToast, apiService,rx,observeOnScope,$q,$state) {

    this.scope = $scope
    this.rx = rx
    this.localStorageService = LocalStorageService
    this.authService = AuthService
    this.topics = []
    this.topicMap = new Map()
    this.apiService = apiService
    this.firstLogin = true
    this.q = $q
    this.state = $state
    this.ngToast = ngToast
    this.myTopicMap = new Map()
    this.myTopics = []

    observeOnScope($scope, 'vm.topics')
      .delay(1000) // delay for saving topics
      .subscribe(({oldValue, newValue}) => {
        if (newValue.length > 0) {
          this.localStorageService.setObject('topics', newValue)
        }
      })

    observeOnScope($scope, 'vm.myTopics')
      .skip(1)
      .subscribe(({oldValue, newValue}) => {
          console.log("save my topics")
          this.localStorageService.setObject('myTopics', newValue)
      })

    $scope.$on('$ionicView.loaded', (e) => {

      this.authService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
        this.isLoggedIn = isLoggedIn

        if(isLoggedIn && this.firstLogin) {
          // auto refresh for logged in user
          this.loadList()

          // unset to false to prevent next loading
          this.firstLogin = false
        }

        else if (!isLoggedIn && !this.firstLogin) {
          // auto refresh for non logged in user
          this.loadList()
          this.firstLogin = true
        }
      }).subscribe()


      this.localStorageService.getObject('myTopics').subscribe(myTopics => {
        this.updateMyTopics(myTopics)


        this.topicsSubscription = this.localStorageService.getObject('topics')
          .do(topics => {
            if (topics) {
              console.log('[TopicListController]', 'using cache')
            }
          })
          .flatMap(topics => {
            return topics
              ? rx.Observable.just(topics)
              : this.apiService.topicList()
                .do(() => this.localStorageService.set('topics-cache-timestamp', moment().unix()))
          })
          .safeApply($scope, topics => {
            this.updateTopics(topics)
          })
          .subscribe()

      })

    })

    $scope.$on('$ionicView.enter', (e) => {

      this.authService.getUsername().safeApply(this.scope, username => {
        this.username = username
      }).subscribe()

      this.localStorageService.get('topics-cache-timestamp')
      .safeApply($scope, data => {
        if(data){
          this.cacheTimestamp = moment(data * 1000).fromNow()
          console.log(this.cacheTimestamp)

        }
      }).subscribe()

    })

  }

  reset(){
    // reset the model
    // this.topics = []
    this.topicsSubscription && this.topicsSubscription.dispose()
  }

  loadList() {

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


  doRefresh(){
    // refresh to load list
    this.authService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
      this.isLoggedIn = isLoggedIn
    }).subscribe()

    this.reset()

    this.loadList()
  }

  canShowGroupNameIniOSReview(groupName){
    return !ionic.Platform.isIOS() || groupName != 'Mobile Phone'
  }

  canShowIniOSReview(topicId){
    const blackList = [121,123,202]
    return !ionic.Platform.isIOS() || (blackList.indexOf(parseInt(topicId)) < 0 || (this.isLoggedIn && this.username != 'logary917'))
  }

  canShowSectionInIOSReview(topicId){
    const blackList = [171,168,170,44,277,202,-1] // -1 is IR Zone
    return !ionic.Platform.isIOS() || (blackList.indexOf(parseInt(topicId)) < 0 || (this.isLoggedIn && this.username != 'logary917'))
  }

  longPressTopic(topic){
    if(this.myTopicMap.get(topic.id)){
      this.ngToast.success(`<i class="ion-alert-circled"> <b><b>${topic.name}</b>喜愛程度 +1</i>`)
    } else {
      this.ngToast.success(`<i class="ion-ios-checkmark"> 成功加入<b>${topic.name}</b>到我的版塊</i>`)
    }
    this.addToMyTopics(topic)

    this.updateTopics(this.topics)
  }

  longPressMyTopic(topic){
    swal({
      html: `確認從我的版塊移除<b>${topic.name}</b>嗎？`,
      showCancelButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '我要移除'
    }).then((result) => {
      if (result.value) {
        this.scope.$apply(() => {
          this.updateMyTopics(this.myTopics.filter(t => t.id !== topic.id))
        })
      }
    })
  }

  myTopicTutorial(){
    swal({
      text: `這個是範例版塊，不會有喜好程度。你要長按 HKEPC 的版塊才能提升喜好程度！`,
      showCancelButton: false,
    })
  }

  isMyTopic(topic) {
    return this.myTopics.includes(topic)
  }

  addToMyTopics(topic){
    let myTopic = this.myTopicMap.get(topic.id)
    if(myTopic){
      myTopic.rank += 1
      this.myTopicMap.set(myTopic.id, myTopic)
      this.updateMyTopics(this.myTopics.map(t => {
        return t.id === myTopic.id ? myTopic : t
      }))
    } else {
      myTopic = { ...topic, rank: 1, rankedAt: new Date().getTime() }
      this.myTopicMap.set(myTopic.id, myTopic)
      this.updateMyTopics([...this.myTopics, myTopic])
    }

  }

  updateTopics(topics){
    this.topics = topics.map(t => {
      const myTopic = this.myTopicMap.get(t.id)
      return {
        ...t,
        rank: myTopic ? myTopic.rank : 0
      }
    })

    this.topicMap.clear()
    this.topics.forEach(t => this.topicMap.set(t.id, t))

    if(this.myTopics.length > 0) {
      this.myTopics = this.myTopics.map(t => {
        const description = this.topicMap.get(t.id).description
        return { ...t, description }
      })

      this.myTopicMap.clear()

      this.myTopics.forEach(t => this.myTopicMap.set(t.id, t))
    }
  }

  updateMyTopics(myTopics){
    this.myTopics = myTopics.sort((t1,t2) => {
      return t1.rank < t2.rank
    })

    this.myTopicMap.clear()

    this.myTopics.forEach(t => this.myTopicMap.set(t.id, t))

    this.topics = this.topics.map(t => {
      const myTopic = this.myTopicMap.get(t.id)
      return {
        ...t,
        rank: myTopic ? myTopic.rank : 0
      }
    })

    this.topics.forEach(t => this.topicMap.set(t.id, t))

  }

  getTimes(i){
    return new Array(parseInt(i) || 0)
  }

  onIRSection(){
    if(isiOSNative()){
      this.state.go(Controllers.PostDetailController.STATE, {
        topicId: 202,
        postId: 2295363,
        page: 1
      })
    }
    else if(isAndroidNative()){
      this.state.go(Controllers.PostDetailController.STATE, {
        topicId: 180,
        postId: 2266086,
        page: 1
      })
    }
    else {
      this.state.go(Controllers.IRListController.STATE)
    }
  }
}