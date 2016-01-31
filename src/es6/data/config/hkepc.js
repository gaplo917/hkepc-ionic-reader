/**
 * Created by Gaplo917 on 9/1/2016.
*/
const PROXY_URL = 'http://proxy.ionic-reader.xyz'
const BASE_URL = `${PROXY_URL}/www.hkepc.com/forum`
const IMAGE_URL = 'http://www.hkepc.com/forum'
const VERSION = "v0.1.0"
function getMobileOperatingSystem(){
  "use strict";
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if( userAgent.match( /iPad/i ) ) {
    return 'iPad';
  }
  else if (userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i )){
    return 'iPhone'
  }
  else if( userAgent.match( /Android/i ) ) {
    return 'Android';
  }
  else {
    return 'Web';
  }
}
module.exports = {
  baseUrl: BASE_URL,
  imageUrl:IMAGE_URL,
  forum: {
    index: () => `${BASE_URL}/index.php`,
    topics: (topicId,page) => `${BASE_URL}/forumdisplay.php?fid=${topicId}&page=${page}`,
    posts: (topicId,postId,page) => `${BASE_URL}/viewthread.php?fid=${topicId}&tid=${postId}&page=${page}`,
    login: () => `${BASE_URL}/logging.php?action=login&loginsubmit=yes&loginfield=username`,
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
    pm: (id) => `${BASE_URL}/pm.php?uid=${id}&filter=privatepm&daterange=5#new`,
    notifications: () => `${BASE_URL}/notice.php`,
    findMessage:(postId,messageId) => `${BASE_URL}/redirect.php?goto=findpost&ptid=${postId}&pid=${messageId}`
  },
  auth:{
    id: 'cdb_sid',
    token: 'cdb_auth',
    expire: 'expires'
  },
  signature: () => {
    "use strict";
    return `[size=1][color=Silver]via HKEPC Ionic Reader ${VERSION} - ${getMobileOperatingSystem()}[/color][/size]`
  },
  data:{
    gifs:[
      {
        "code": ":loveliness:",
        "url": "loveliness.png"
      },
      {
        "code": ":happybday:",
        "url": "icon_happybday.png"
      },
      {
        "code": ":redface:",
        "url": "icon22.png"
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
        "code": ":silent:",
        "url": "smile_44.png"
      },
      {
        "code": ":crutch:",
        "url": "icon_crutch.png"
      },
      {
        "code": ":wahaha:",
        "url": "icon_clap.png"
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
        "code": ":dizzy:",
        "url": "dizzy.png"
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
        "code": ":baby:",
        "url": "icon_baby.png"
      },
      {
        "code": ":band:",
        "url": "icon_band.png"
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
        "code": ":dev:",
        "url": "icon_dev.png"
      },
      {
        "code": ":eek:",
        "url": "icon_eek.png"
      },
      {
        "code": ":cry:",
        "url": "icon_cry.png"
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
      }
    ]
  }
}