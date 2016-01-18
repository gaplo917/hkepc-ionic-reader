/**
 * Created by Gaplo917 on 9/1/2016.
 */
const BASE_URL = 'http://www.hkepc.com/forum'

module.exports = {
  baseUrl: BASE_URL,
  forum: {
    index: () => `${BASE_URL}/index.php`,
    topics: (topicId,page) => `${BASE_URL}/forumdisplay.php?fid=${topicId}&page=${page}`,
    posts: (topicId,postId,page) => `${BASE_URL}/viewthread.php?fid=${topicId}&tid=${postId}&page=${page}`,
    login: () => `${BASE_URL}/logging.php?action=login&loginsubmit=yes&floatlogin=yes&inajax=1`,
    replyPage:(reply) => {

      /**
       * reply :{
       *    id: Int,
       *    postId: Int,
       *    topicId: Int,
       *    type: Int ,  1 = None, 2 = Reply , 3 = Quote
       * }
       */

      const url = `${BASE_URL}/post.php?action=reply&fid=${reply.topicId}&tid=${reply.postId}`

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
    pmList: (page) => `${BASE_URL}/pm.php?filter=privatepm&page=${page}`,
    pm: (id) => `${BASE_URL}/pm.php?uid=${id}&filter=privatepm&daterange=5#new`
  },

  data:{
  }
}