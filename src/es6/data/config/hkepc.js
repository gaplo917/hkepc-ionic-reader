/**
 * Created by Gaplo917 on 9/1/2016.
 */
module.exports = {
  domain: 'http://www.hkepc.com/',
  forum: {
    index: 'http://www.hkepc.com/forum/index.php',
    topics: (topicId) => `http://www.hkepc.com/forum/forumdisplay.php?fid=${topicId}`,
    posts: (topicId,postId) => `http://www.hkepc.com/forum/viewthread.php?fid=${topicId}&tid=${postId}`,
    login: 'http://www.hkepc.com/forum/logging.php?action=login&loginsubmit=yes&floatlogin=yes&inajax=1'
  },

  data:{
    topics:{
      "120" : "興趣百科"
    }
  }
}