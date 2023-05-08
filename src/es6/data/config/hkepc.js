/**
 * Created by Gaplo917 on 9/1/2016.
*/
const PROXY_URL = 'https://proxy.hkepc.pro/www.hkepc.com' // default proxy url (local development use 'http://0.0.0.0:1337/www.hkepc.com')
const BASE_URL = `https://www.hkepc.com`
const BASE_FORUM_URL = `${BASE_URL}/forum`
const IMAGE_URL = 'https://www.hkepc.com/forum'
const VERSION = '5.0.0'
function getMobileOperatingSystem (userAgent) {
  const ua = userAgent || navigator.userAgent || navigator.vendor || window.opera

  return ua.match(/Windows Phone \d+/i) ||
      ua.match(/iPad/i) ||
      ua.match(/iPhone/i) ||
      ua.match(/iPod/i) ||
      ua.match(/Android/i) ||
      'Web'
}
module.exports = {
  userAgent: () => getMobileOperatingSystem(),
  proxy: PROXY_URL,
  baseUrl: BASE_URL,
  baseForumUrl: BASE_FORUM_URL,
  imageUrl: IMAGE_URL,
  version: VERSION,
  forum: {
    index: () => `${BASE_FORUM_URL}/index.php`,
    latestNext: (searchId, page) => {
      if (searchId) {
        return `${BASE_FORUM_URL}/search.php?searchid=${searchId}&orderby=lastpost&ascdesc=desc&searchsubmit=yes&page=${page}`
      } else {
        return `${BASE_FORUM_URL}/search.php?srchfrom=86400&&orderby=lastpost&ascdesc=desc&searchsubmit=yes`
      }
    },
    latestPostNext: (searchId, page) => {
      if (searchId) {
        return `${BASE_FORUM_URL}/search.php?searchid=${searchId}&orderby=dateline&ascdesc=desc&searchsubmit=yes&page=${page}`
      } else {
        return `${BASE_FORUM_URL}/search.php?srchfrom=86400&&orderby=dateline&ascdesc=desc&searchsubmit=yes&page=${page}`
      }
    },
    search: () => {
      return `${BASE_FORUM_URL}/search.php`
    },
    searchNext: (searchId, page) => {
      return `${BASE_FORUM_URL}/search.php?searchid=${searchId}&orderby=lastpost&ascdesc=desc&searchsubmit=yes&page=${page}`
    },
    topics: (topicId, page, filter, orderby) => {
      return [
        `${BASE_FORUM_URL}/forumdisplay.php?fid=${topicId}`,
        `page=${page}`,
        `filter=${filter >= 0 ? `type&typeid=${filter}` : ''}`,
        `orderby=${orderby || ''}`
      ].join('&')
    },
    posts: (topicId, postId, page, orderType, filterOnlyAuthorId) => `${BASE_FORUM_URL}/viewthread.php?fid=${topicId}&tid=${postId}&page=${page}&ordertype=${orderType}&authorid=${filterOnlyAuthorId}`,
    login: () => `${BASE_FORUM_URL}/logging.php?action=login&loginsubmit=yes&loginfield=username`,
    logout: (formhash) => `${BASE_FORUM_URL}/logging.php?action=logout&formhash=${formhash}`,
    news: (page) => `${BASE_URL}/moreNews/page/${page}`,
    replyPage: (reply) => {
      /**
       * reply :{
       *    id: Int,
       *    postId: Int,
       *    topicId: Int,
       *    type: Int ,  1 = None, 2 = Reply , 3 = Quote
       * }
       */

      const url = `${BASE_FORUM_URL}/post.php?action=reply&fid=${reply.topicId}&tid=${reply.postId}`

      switch (reply.type) {
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
    reportDialog: (topicId, postId, messageId) => `${BASE_FORUM_URL}/misc.php?action=report&fid=${topicId}&tid=${postId}&pid=${messageId}&infloat=yes&handlekey=report&inajax=1&ajaxtarget=fwin_content_report`,
    editMessage: (topicId, postId, messageId) => `${BASE_FORUM_URL}/post.php?action=edit&fid=${topicId}&tid=${postId}&pid=${messageId}`,
    pmList: (page) => `${BASE_FORUM_URL}/pm.php?filter=privatepm&page=${page}`,
    pm: (id) => `${BASE_FORUM_URL}/pm.php?uid=${id}&filter=privatepm&daterange=5#new`,
    notifications: (page) => `${BASE_FORUM_URL}/notice.php?page=${page}`,
    findMessage: (postId, messageId) => `${BASE_FORUM_URL}/redirect.php?goto=findpost&ptid=${postId}&pid=${messageId}`,
    newPost: (fid) => `${BASE_FORUM_URL}/post.php?action=newthread&fid=${fid}`,
    memberCenter: () => `${BASE_FORUM_URL}/memcp.php`,
    checkPM: () => `${BASE_FORUM_URL}/pm.php?checknewpm=0&inajax=1&ajaxtarget=myprompt_check`,
    settings: () => `${BASE_FORUM_URL}/memcp.php?action=profile&typeid=5`,
    addFavPost: (postId) => `${BASE_FORUM_URL}/my.php?item=favorites&tid=${postId}&inajax=1&ajaxtarget=favorite_msg`,
    subscribeNewReply: (postId) => `${BASE_FORUM_URL}/my.php?item=attention&action=add&tid=${postId}&inajax=1&ajaxtarget=favorite_msg`,
    space: (uid) => `${BASE_FORUM_URL}/space.php?uid=${uid}`,
    myPost: (page, type) => {
      switch (type) {
        case 'threads':
          return `${BASE_FORUM_URL}/my.php?item=threads&page=${page}`
        case 'favorites':
          return `${BASE_FORUM_URL}/my.php?item=favorites&type=thread&page=${page}`
        case 'attention':
          return `${BASE_FORUM_URL}/my.php?item=attention&type=thread&page=${page}`
        default:
          throw new Error('no matching type on myPost')
      }
    },
    myReply: (page) => `${BASE_FORUM_URL}/my.php?item=posts&page=${page}`,
    preSendPm: (uid) => `${BASE_FORUM_URL}/pm.php?action=new&uid=${uid}&infloat=yes&handlekey=sendpm&inajax=1&ajaxtarget=fwin_content_sendpm`
  },
  auth: {
    id: 'cdb_sid',
    token: 'cdb_auth',
    expire: 'expires',
    formhash: 'formhash'
  },
  signature: (opt) => {
    const { androidVersion, iosVersion } = opt
    if (androidVersion) {
      const isFree = androidVersion[androidVersion.length - 1] === 'F'
      const appName = isFree ? 'HKEPC IR' : 'HKEPC IRF'
      return `[size=1][color=Silver]via ${appName} ${VERSION} - Android(${androidVersion})[/color][/size]`
    } else if (iosVersion) {
      const isFree = iosVersion[iosVersion.length - 1] === 'F'
      const appName = isFree ? 'HKEPC IR' : 'HKEPC IRF'
      return `[size=1][color=Silver]via ${appName} ${VERSION} - iOS(${iosVersion})[/color][/size]`
    } else {
      return `[size=1][color=Silver]via HKEPC IR ${VERSION} - ${getMobileOperatingSystem()}[/color][/size]`
    }
  },
  data: {
    gifs: [
      {
        code: ':dev:',
        url: 'icon_dev.gif'
      },
      {
        code: ':loveliness:',
        url: 'loveliness.gif'
      },
      {
        code: ':wahaha:',
        url: 'icon_clap.gif'
      },
      {
        code: ':xd:',
        url: 'icon77.gif'
      },
      {
        code: ':?:',
        url: 'icon_confused.gif'
      },
      {
        code: ':d:',
        url: 'icon_biggrin.gif'
      },
      {
        code: ':p:',
        url: 'icon_tongue.gif'
      },
      {
        code: ':redface:',
        url: 'icon22.gif'
      },
      {
        code: ':dizzy:',
        url: 'dizzy.gif'
      },
      {
        code: ':cry:',
        url: 'icon_cry.gif'
      },
      {
        code: ':help:',
        url: 'icon_help.gif'
      },
      {
        code: ':naug:',
        url: 'icon_naughty.gif'
      },
      {
        code: ':good:',
        url: 'icon_good.gif'
      },
      {
        code: ':discuss:',
        url: 'icon_discuss.gif'
      },
      {
        code: ':hitwall:',
        url: 'icon_hitwall.gif'
      },
      {
        code: ':goodjob:',
        url: 'icon_goodjob.gif'
      },
      {
        code: ':kicking:',
        url: 'icon_kicking.gif'
      },
      {
        code: ':giveup:',
        url: 'icon_giveup.gif'
      },
      {
        code: ':shutup:',
        url: 'shutup.gif'
      },
      {
        code: ':titter:',
        url: 'titter.gif'
      },
      {
        code: ':cheers:',
        url: 'icon_cheers2.gif'
      },
      {
        code: ':shifty:',
        url: 'VsX4_shifty_P31Twc0M1TeT.gif'
      },
      {
        code: ':crybye:',
        url: 'icon_crybye.gif'
      },
      {
        code: ':agree:',
        url: 'icon_agree.gif'
      },
      {
        code: ':adore:',
        url: 'icon_adore.gif'
      },
      {
        code: ':haha:',
        url: 'icon_haha.gif'
      },
      {
        code: ':silent:',
        url: 'smile_44.gif'
      },
      {
        code: ':crutch:',
        url: 'icon_crutch.gif'
      },
      {
        code: ':faint:',
        url: 'smile_27.gif'
      },
      {
        code: ':drool:',
        url: 'icon_drool.gif'
      },
      {
        code: ':chair:',
        url: 'icon_chair.gif'
      },
      {
        code: ':angry:',
        url: 'icon_angry2.gif'
      },
      {
        code: ':sleep:',
        url: 'icon_sleep.gif'
      },
      {
        code: ':noway:',
        url: 'noway.gif'
      },
      {
        code: ':fight:',
        url: 'icon_fight.gif'
      },
      {
        code: ':smoke:',
        url: 'icon_smoke.gif'
      },
      {
        code: ':photo:',
        url: 'icon_photo.gif'
      },
      {
        code: ':baby:',
        url: 'icon_baby.gif'
      },
      {
        code: ':band:',
        url: 'icon_band.gif'
      },
      {
        code: ':kiss:',
        url: 'icon_kiss.gif'
      },
      {
        code: ':nono:',
        url: 'icon_nono.gif'
      },
      {
        code: ':mad:',
        url: 'icon_mad.gif'
      },
      {
        code: ':eek:',
        url: 'icon_eek.gif'
      },
      {
        code: ':gun:',
        url: 'icon_gun2.gif'
      },
      {
        code: ':ar:',
        url: 'smile_38.gif'
      },
      {
        code: ':happybday:',
        url: 'icon_happybday.gif'
      }
    ]
  }
}
