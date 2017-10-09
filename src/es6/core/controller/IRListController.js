/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
import {CommonInfoExtractRequest} from '../model/CommonInfoExtractRequest'
import {PushHistoryRequest} from '../model/PushHistoryRequest'
import * as Controllers from './index'

const cheerio = require('cheerio')

export class IRListController {
  static get STATE() { return 'tab.topics-ir'}
  static get NAME() { return 'IRListController'}
  static get CONFIG() { return {
    url: '/ir',
    views: {
      'tab-topics': {
        templateUrl: 'templates/ir/index.html',
        controller: IRListController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope,$http,$state,$ionicHistory) {
    this.state = $state
    this.ionicHistory = $ionicHistory
  }

  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.TopicListController.STATE)
    }
  }

  relativeMomentize(dateStr){
    if(moment(dateStr, 'YYYY-M-D hh:mm').diff(new Date(),'days') >= -3 ){
      return moment(dateStr, 'YYYY-M-D hh:mm').fromNow()
    } else {
      return dateStr
    }
  }

  swipeLeft(){
    if(this.canSwipeBack){
      this.onBack()
    }
  }
}
