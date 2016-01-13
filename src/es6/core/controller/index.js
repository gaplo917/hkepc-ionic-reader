
import {PostController} from './PostController'
import {PostListController} from './PostListController'
import {TopicListController} from './TopicListController'
import {ReplyPostController} from './ReplyPostController'

export var topics = {
  action: TopicListController,
  state:'tab.topics',
  name : "TopicCtrl",
  config: {
    cache: false,
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

export var replyPost = {
  action: ReplyPostController,
  state: 'tab.topics-posts-reply',
  name: "ReplyPostCtrl",
  config:{
    url: '/topics/:topicId/posts/:postId/reply',
    views: {
      'tab-topics': {
        templateUrl: 'templates/reply-post.html',
        controller: 'ReplyPostCtrl'
      }
    }
  }
}