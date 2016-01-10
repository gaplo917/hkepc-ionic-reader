
import {ForumController} from './forum'


export var topics = {
  action: ForumController.getTopics,
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
  action: ForumController.getPosts,
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
  action: ForumController.getPost,
  state: 'tab.topics-posts-detail',
  name: "PostDetailCtrl",
  config:{
    url: '/topics/:topicId/posts/:postId/page/:page',
    views: {
      'tab-topics': {
        templateUrl: 'templates/post-detail.html',
        controller: 'PostDetailCtrl'
      }
    }
  }
}