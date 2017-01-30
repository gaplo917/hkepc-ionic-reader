/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"

const cheerio = require('cheerio')

export class TopicListController {
  static get STATE() { return 'tab.topics'}
  static get NAME() { return 'TopicListController'}
  static get CONFIG() { return {
    url: '/topics',
    views: {
      'tab-topics': {
        templateUrl: 'templates/tab-topics.html',
        controller: TopicListController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope,$http,LocalStorageService,AuthService,ngToast, apiService,rx,observeOnScope,$q) {

    this.scope = $scope
    this.http = $http
    this.rx = rx
    this.localStorageService = LocalStorageService
    this.authService = AuthService
    this.topics = []
    this.apiService = apiService
    this.q = $q

    rx.Observable.interval(30000)
      .startWith(0)
      .flatMap(() => this.localStorageService.get('topics-cache-timestamp'))
      .safeApply($scope, data => {
        if(data){
          this.cacheTimestamp = moment(data * 1000).fromNow()
          console.log(this.cacheTimestamp)

        }
      }).subscribe()


    observeOnScope($scope, 'vm.topics')
      .delay(1000) // delay for saving topics
      .subscribe(({newValue, oldValue}) => {
        if (newValue.length > 0) {
          this.localStorageService.setObject('topics', newValue)
        }
      })


    $scope.$on('$ionicView.loaded', (e) => {
      console.log("loaded")

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
          this.topics = topics
        })
        .subscribe()
    })

    $scope.$on('$ionicView.enter', (e) => {

      this.authService.isLoggedIn().subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn

        if(isLoggedIn) {
          this.loadList()
        }

      })

      this.authService.getUsername().subscribe(username => {
        this.username = username
      })

    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
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

        this.topics = topics
      })
      .subscribe()
  }


  doRefresh(){

    this.reset()

    this.loadList()
  }

  canShowGroupNameIniOSReview(groupName){
    return groupName != 'Mobile Phone' || (this.isLoggedIn && this.username != 'logary917')
  }

  canShowIniOSReview(topicId){
    const blackList = [121,123,202]
    return blackList.indexOf(parseInt(topicId)) < 0 || (this.isLoggedIn && this.username != 'logary917')
  }

  canShowSectionInIOSReview(topicId){
    const blackList = [171,168,170,44,277,202]
    return blackList.indexOf(parseInt(topicId)) < 0 || (this.isLoggedIn && this.username != 'logary917')
  }

}