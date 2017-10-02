/**
 * Created by Gaplo917 on 9/1/2016.
*/
const PROXY_URL = 'https://ionic-reader.xyz'
const BASE_URL = `https://www.hkepc.com`
const BASE_FORUM_URL = `${BASE_URL}/forum`
const IMAGE_URL = 'https://www.hkepc.com/forum'
const VERSION = "v1.0.0"
function getMobileOperatingSystem(userAgent){
  const ua = userAgent || navigator.userAgent || navigator.vendor || window.opera;

  return ua.match(/Windows Phone \d+/i)
      || ua.match( /iPad/i )
      || ua.match( /iPhone/i )
      || ua.match( /iPod/i )
      || ua.match( /Android/i )
      || 'Web'

}
module.exports = {
  userAgent: () => getMobileOperatingSystem(),
  proxy: PROXY_URL,
  baseUrl: BASE_URL,
  baseForumUrl: BASE_FORUM_URL,
  imageUrl:IMAGE_URL,
  version: VERSION,
  forum: {
    index: () => `${BASE_FORUM_URL}/index.php`,
    latestNext: (searchId,page) => {
      return `${BASE_FORUM_URL}/search.php?searchid=${searchId}&orderby=lastpost&ascdesc=desc&searchsubmit=yes&page=${page}`
    },
    search:() => {
      return `${BASE_FORUM_URL}/search.php`
    },
    searchNext: (searchId, page) => {
      return `${BASE_FORUM_URL}/search.php?searchid=${searchId}&orderby=lastpost&ascdesc=desc&searchsubmit=yes&page=${page}`
    },
    topics: (topicId,page,filter,orderby) => {
      return topicId == 'latest'
          ? `${BASE_FORUM_URL}/search.php?srchfrom=12000&searchsubmit=yes&page=${page}`
          : [
              `${BASE_FORUM_URL}/forumdisplay.php?fid=${topicId}`,
              `page=${page}`,
              `filter=${filter >= 0 ? `type&typeid=${filter}` : ''}`,
              `orderby=${orderby||''}`
            ].join("&")
    },
    posts: (topicId,postId,page,orderType,filterOnlyAuthorId) => `${BASE_FORUM_URL}/viewthread.php?fid=${topicId}&tid=${postId}&page=${page}&ordertype=${orderType}&authorid=${filterOnlyAuthorId}`,
    login: () => `${BASE_FORUM_URL}/logging.php?action=login&loginsubmit=yes&loginfield=username`,
    logout: (formhash) => `${BASE_FORUM_URL}/logging.php?action=logout&formhash=${formhash}`,
    news: (page) => `${BASE_URL}/moreNews/page/${page}`,
    replyPage:(reply) => {

      /**
       * reply :{
       *    id: Int,
       *    postId: Int,
       *    topicId: Int,
       *    type: Int ,  1 = None, 2 = Reply , 3 = Quote
       * }
       */

      const url = `${BASE_FORUM_URL}/post.php?action=reply&fid=${reply.topicId}&tid=${reply.postId}`

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
    reportPage:(topicId,postId,messageId) => `${BASE_FORUM_URL}/misc.php?action=report&fid=${topicId}&tid=${postId}&pid=${messageId}`,
    editMessage:(topicId,postId,messageId) => `${BASE_FORUM_URL}/post.php?action=edit&fid=${topicId}&tid=${postId}&pid=${messageId}`,
    pmList: (page) => `${BASE_FORUM_URL}/pm.php?filter=privatepm&page=${page}`,
    pm: (id) => `${BASE_FORUM_URL}/pm.php?uid=${id}&filter=privatepm&daterange=5#new`,
    notifications: (page) => `${BASE_FORUM_URL}/notice.php?page=${page}`,
    findMessage:(postId,messageId) => `${BASE_FORUM_URL}/redirect.php?goto=findpost&ptid=${postId}&pid=${messageId}`,
    newPost:(fid) => `${BASE_FORUM_URL}/post.php?action=newthread&fid=${fid}`,
    memberCenter: () => `${BASE_FORUM_URL}/memcp.php`,
    checkPM: () => `${BASE_FORUM_URL}/pm.php?checknewpm=0&inajax=1&ajaxtarget=myprompt_check`,
    settings:() => `${BASE_FORUM_URL}/memcp.php?action=profile&typeid=5`,
    subscribeNewReply: (postId) => `${BASE_FORUM_URL}/my.php?item=attention&action=add&tid=${postId}&inajax=1&ajaxtarget=favorite_msg`,
    space: (uid) => `${BASE_FORUM_URL}/space.php?uid=${uid}`,
    myPost: (page) => `${BASE_FORUM_URL}/my.php?item=threads&page=${page}`,
    myReply: (page) => `${BASE_FORUM_URL}/my.php?item=posts&page=${page}`,
  },
  auth:{
    id: 'cdb_sid',
    token: 'cdb_auth',
    expire: 'expires',
    formhash: 'formhash'
  },
  signature: (color) => {
    return `[size=1][color=Silver]via HKEPC IR Pro ${VERSION} - ${getMobileOperatingSystem()}[/color][/size]`
  },
  data:{
    gifs:[
      {
        "code": ":dev:",
        "url": "icon_dev.png"
      },
      {
        "code": ":loveliness:",
        "url": "loveliness.png"
      },
      {
        "code": ":wahaha:",
        "url": "icon_clap.png"
      },
      {
        "code": ":xd:",
        "url": "icon77.png"
      },
      {
        "code": ":?:",
        "url": "icon_confused.png"
      },
      {
        "code": ":d:",
        "url": "icon_biggrin.png"
      },
      {
        "code": ":p:",
        "url": "icon_tongue.png"
      },
      {
        "code": ":redface:",
        "url": "icon22.png"
      },
      {
        "code": ":dizzy:",
        "url": "dizzy.png"
      },
      {
        "code": ":cry:",
        "url": "icon_cry.png"
      },
      {
        "code": ":help:",
        "url": "icon_help.png"
      },
      {
        "code": ":naug:",
        "url": "icon_naughty.png"
      },
      {
        "code": ":good:",
        "url": "icon_good.png"
      },
      {
        "code": ":discuss:",
        "url": "icon_discuss.png"
      },
      {
        "code": ":hitwall:",
        "url": "icon_hitwall.png"
      },
      {
        "code": ":goodjob:",
        "url": "icon_goodjob.png"
      },
      {
        "code": ":kicking:",
        "url": "icon_kicking.png"
      },
      {
        "code": ":giveup:",
        "url": "icon_giveup.png"
      },
      {
        "code": ":shutup:",
        "url": "shutup.png"
      },
      {
        "code": ":titter:",
        "url": "titter.png"
      },
      {
        "code": ":cheers:",
        "url": "icon_cheers2.png"
      },
      {
        "code": ":shifty:",
        "url": "VsX4_shifty_P31Twc0M1TeT.png"
      },
      {
        "code": ":crybye:",
        "url": "icon_crybye.png"
      },
      {
        "code": ":agree:",
        "url": "icon_agree.png"
      },
      {
        "code": ":adore:",
        "url": "icon_adore.png"
      },
      {
        "code": ":haha:",
        "url": "icon_haha.png"
      },
      {
        "code": ":silent:",
        "url": "smile_44.png"
      },
      {
        "code": ":crutch:",
        "url": "icon_crutch.png"
      },
      {
        "code": ":faint:",
        "url": "smile_27.png"
      },
      {
        "code": ":drool:",
        "url": "icon_drool.png"
      },
      {
        "code": ":chair:",
        "url": "icon_chair.png"
      },
      {
        "code": ":angry:",
        "url": "icon_angry2.png"
      },
      {
        "code": ":sleep:",
        "url": "icon_sleep.png"
      },
      {
        "code": ":noway:",
        "url": "noway.png"
      },
      {
        "code": ":fight:",
        "url": "icon_fight.png"
      },
      {
        "code": ":smoke:",
        "url": "icon_smoke.png"
      },
      {
        "code": ":photo:",
        "url": "icon_photo.png"
      },
      {
        "code": ":baby:",
        "url": "icon_baby.png"
      },
      {
        "code": ":band:",
        "url": "icon_band.png"
      },
      {
        "code": ":kiss:",
        "url": "icon_kiss.png"
      },
      {
        "code": ":nono:",
        "url": "icon_nono.png"
      },
      {
        "code": ":mad:",
        "url": "icon_mad.png"
      },
      {
        "code": ":eek:",
        "url": "icon_eek.png"
      },
      {
        "code": ":gun:",
        "url": "icon_gun2.png"
      },
      {
        "code": ":ar:",
        "url": "smile_38.png"
      },
      {
        "code": ":happybday:",
        "url": "icon_happybday.png"
      }
    ]
  }
}