
import {PostController} from './PostController'
import {PostListController} from './PostListController'
import {TopicListController} from './TopicListController'
import {ChatController} from './ChatController'
import {ChatDetailController} from './ChatDetailController'
import {TabController} from './TabController'

export var tab = {
  action: TabController,
  state:'tab',
  name : "TabCtrl",
  config: {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabCtrl'
  }
}

export var topics = {
  action: TopicListController,
  state:'tab.topics',
  name : "TopicCtrl",
  config: {
    url: '/topics',
    views: {
      'tab-topics': {
        templateUrl: 'templates/tab-topics.html',
        controller: "TopicCtrl"
      }
    }
  }
}

export var posts = {
  action: PostListController,
  state:'tab.topics-posts',
  name:"PostsCtrl",
  config: {
    url: '/topics/:topicId/page/:page',
    views: {
      'tab-topics': {
        templateUrl: 'templates/topic-posts.html',
        controller: 'PostsCtrl'
      }
    }
  }
}

export var post = {
  action: PostController,
  state: 'tab.topics-posts-detail',
  name: "PostDetailCtrl",
  config:{
    cache: false,
    url: '/topics/:topicId/posts/:postId/page/:page',
    views: {
      'tab-topics': {
        templateUrl: 'templates/post-detail.html',
        controller: 'PostDetailCtrl'
      }
    }
  }
}

export var chats = {
  action: ChatController,
  state: 'tab.chats',
  name: "ChatCtrl",
  config:{
    cache: false,
    url: '/chats',
    views: {
      'tab-chats': {
        templateUrl: 'templates/tab-chats.html',
        controller: 'ChatCtrl'
      }
    }
  }
}

export var chat = {
  action: ChatDetailController,
  state: 'tab.chat-detail',
  name: "ChatDetailCtrl",
  config:{
    cache: false,
    url: '/chats/:id',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  }
}
