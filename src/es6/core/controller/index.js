
import {PostController} from './PostController'
import {PostListController} from './PostListController'
import {TopicListController} from './TopicListController'
import {ChatController} from './ChatController'
import {ChatDetailController} from './ChatDetailController'
import {TabController} from './TabController'
import {AuthController} from './AuthController'
import {NotificationController} from './NotificationController'
import {LikesController} from './LikesController'

export const tab = {
  action: TabController,
  state:'tab',
  name : "TabCtrl",
  config: {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabCtrl',
    controllerAs: 'vm'
  }
}

export const topics = {
  action: TopicListController,
  state:'tab.topics',
  name : "TopicCtrl",
  config: {
    url: '/topics',
    views: {
      'tab-topics': {
        templateUrl: 'templates/tab-topics.html',
        controller: "TopicCtrl",
        controllerAs: 'vm'
      }
    }
  }
}

export const posts = {
  action: PostListController,
  state:'tab.topics-posts',
  name:"PostsCtrl",
  config: {
    url: '/topics/:topicId/page/:page',
    views: {
      'tab-topics': {
        templateUrl: 'templates/topic-posts.html',
        controller: 'PostsCtrl',
        controllerAs: 'vm'
      }
    }
  }
}

export const post = {
  action: PostController,
  state: 'tab.topics-posts-detail',
  name: "PostDetailCtrl",
  config:{
    url: '/topics/:topicId/posts/:postId/page/:page',
    views: {
      'tab-topics': {
        templateUrl: 'templates/post-detail.html',
        controller: 'PostDetailCtrl',
        controllerAs: 'vm'
      }
    }
  }
}

export const chats = {
  action: ChatController,
  state: 'tab.chats',
  name: "ChatCtrl",
  config:{
    url: '/chats',
    cache: false,
    views: {
      'tab-chats': {
        templateUrl: 'templates/tab-chats.html',
        controller: 'ChatCtrl',
        controllerAs: 'vm'
      }
    }
  }
}

export const chat = {
  action: ChatDetailController,
  state: 'tab.chat-detail',
  name: "ChatDetailCtrl",
  config:{
    url: '/chats/:id',
    cache: false,
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl',
        controllerAs: 'vm'
      }
    }
  }
}

export const auth = {
  action: AuthController,
  state: 'tab.account',
  name: 'AuthCtrl',
  config: {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AuthCtrl',
        controllerAs: 'vm'
      }
    }
  }
}

export const notification = {
  action: NotificationController,
  state: 'tab.notifications',
  name: 'NotificationCtrl',
  config: {
    url: '/notifications',
    cache: false,
    views: {
      'tab-notifications': {
        templateUrl: 'templates/tab-notifications.html',
        controller: 'NotificationCtrl',
        controllerAs: 'vm'
      }
    }
  }
}

export const likes = {
  action : LikesController,
  state: 'tab.likes',
  name: 'LikesCtrl',
  config: {
    url: '/likes',
    cache: false,
    views: {
      'tab-likes': {
        templateUrl: 'templates/tab-likes.html',
        controller: 'LikesCtrl',
        controllerAs: 'vm'
      }
    }
  }
}