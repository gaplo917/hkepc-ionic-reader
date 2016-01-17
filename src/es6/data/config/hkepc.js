/**
 * Created by Gaplo917 on 9/1/2016.
 */
module.exports = {
  baseUrl: 'http://www.hkepc.com/forum',
  forum: {
    image:'http://www.hkepc.com/forum/',
    index: 'http://www.hkepc.com/forum/index.php',
    topics: (topicId,page) => `http://www.hkepc.com/forum/forumdisplay.php?fid=${topicId}&page=${page}`,
    posts: (topicId,postId,page) => `http://www.hkepc.com/forum/viewthread.php?fid=${topicId}&tid=${postId}&page=${page}`,
    login: 'http://www.hkepc.com/forum/logging.php?action=login&loginsubmit=yes&floatlogin=yes&inajax=1',
    replyPage:(reply) => {

      /**
       * reply :{
       *    id: Int,
       *    postId: Int,
       *    topicId: Int,
       *    type: Int
       * }
       */

      const url = `http://www.hkepc.com/forum/post.php?action=reply&fid=${reply.topicId}&tid=${reply.postId}`

      switch(reply.type){
        case 1:
          return url
        case 2:
          return `${url}&reppost=${reply.id}`
        case 3:
          return `${url}&repquote=${reply.id}`
        default:
          return url
      }

    },
    reply: (topicId,postId) => `http://www.hkepc.com/forum/post.php?action=reply&fid=${topicId}&tid=${postId}&extra=&replysubmit=yes`
  },

  data:{
  }
}