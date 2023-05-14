import * as URLUtils from '../../utils/url'
import cheerio from 'cheerio'
import * as HKEPC from '../../data/config/hkepc'
import { startsWith, replace } from 'lodash-es'

const matchCount = (str, regex) => {
  const result = str.match(regex)
  return result ? result.length : 0
}

export default class Mapper {
  static apiSuccess(o) {
    return { message: o.message }
  }

  static topicListHtmlToTopicList(html) {
    const $ = html.getCheerio()

    return $('#mainIndex > div')
      .map((i, elem) => {
        const source = $(elem)

        const groupName = source.hasClass('group') ? source.find('a').text() : undefined

        const topicId = URLUtils.getQueryVariable(source.find('.forumInfo .caption').attr('raw-href'), 'fid')
        const topicName = source.find('.forumInfo .caption').text()
        const description = source.find('.forumInfo p').next().text()
        const image = source.find('.icon img').attr('raw-src')

        return {
          id: topicId,
          name: topicName,
          image,
          groupName,
          description: description.replace('最後發表', ' -'),
        }
      })
      .get()
      .filter((it) => it.id || it.groupName)
  }

  static fullTopicListFromSearchHtmlToTopicList(html) {
    const blackList = [
      { id: '118', name: '熱點投票', isSubTopic: false },
      { id: '154', name: 'HKEPC X CoolerMaster Case Mod 2009', isSubTopic: false },
      { id: '101', name: 'HKEPC X CoolerMaster Case Mod 2008', isSubTopic: true },
      { id: '204', name: 'Galaxy GTS450 Jackpot 大賽賽區', isSubTopic: false },
      { id: '242', name: '深水埗．灣仔腦場夏日電腦節2012', isSubTopic: false },
      { id: '303', name: '腦場電腦節 2015', isSubTopic: false },
      { id: '243', name: '香港電腦通訊節2012', isSubTopic: false },
      { id: '216', name: '深水埗．灣仔腦場冬日電腦節2011', isSubTopic: false },
      { id: '273', name: '香港電腦通訊節2013', isSubTopic: false },
      { id: '285', name: '香港腦場電腦節2014', isSubTopic: false },
      { id: '286', name: '香港電腦通訊節2014', isSubTopic: false },
      { id: '196', name: '香港電腦節 2010', isSubTopic: false },
      { id: '302', name: '香港電腦通訊節 2015', isSubTopic: false },
      { id: '245', name: '完結活動記錄區', isSubTopic: false },
      { id: '227', name: 'Sapphire HD 7770 組別', isSubTopic: true },
      { id: '276', name: 'SEAGATE Wireless Plus 試用體驗分享', isSubTopic: true },
      { id: '288', name: 'XFX R9 系列繪圖卡使用體驗分享', isSubTopic: true },
      { id: '295', name: 'NVIDIA x Inno3D 繪圖卡超頻比賽', isSubTopic: true },
      { id: '299', name: 'Linksys 「WRT1200AC」試用分享', isSubTopic: true },
      { id: '300', name: '「SAPPHIRE Next Gen 2015」徵文活動', isSubTopic: true },
      { id: '301', name: '「 ASUS ROG Insight 2015 」徵文活動專區', isSubTopic: true },
      { id: '304', name: 'Linksys WRT 用家專享禮遇', isSubTopic: true },
      { id: '305', name: '「 ASROCK OCF 2015 」徵文活動專區', isSubTopic: true },
      { id: '309', name: '「LINKSYS EA7500．開箱」專區', isSubTopic: true },
      { id: '310', name: 'Synology DSM 6.0 開箱文活動', isSubTopic: true },
      { id: '314', name: 'LINKSYS EA9500 旗艦開箱文專區', isSubTopic: true },
      { id: '315', name: 'LINKSYS MaxStream 系列‧無縫連接新體驗', isSubTopic: true },
      { id: '319', name: 'HyperX Cloud Stinger 開箱試用專區', isSubTopic: true },
      { id: '320', name: '「 Antec 30 週年慶 !! 第十彈」活動專區', isSubTopic: true },
      { id: '321', name: 'LINKSYS WRT1900ACS ．技術開箱活動專區', isSubTopic: true },
      { id: '322', name: '「 LINKSYS VELOP  ．開箱文專區」', isSubTopic: true },
      { id: '323', name: '「 ASUS Tech Forum 2017 」徵文活動專區', isSubTopic: true },
      { id: '324', name: '「升級三年保 !TP-Link 熱賣路由器」', isSubTopic: true },
      { id: '327', name: '「INNO3D Ichill 1070TI 開箱文活動」專區', isSubTopic: true },
      { id: '328', name: 'LINKSYS MaxStream EA9500S．開箱文提交專區', isSubTopic: true },
      { id: '224', name: 'Sapphire HD 7700 超頻比賽(完結)', isSubTopic: true },
      { id: '228', name: 'Sapphire HD 7750 組別', isSubTopic: true },
      { id: '249', name: '免費升級Galaxy GTX660', isSubTopic: true },
      { id: '250', name: 'Everbest x HKEPC「ECS MOD」取消', isSubTopic: true },
      { id: '254', name: '舊"U" 迎新春 - 升級「Piledriver」', isSubTopic: true },
      { id: '263', name: '分享、教學精華文投稿', isSubTopic: true },
      { id: '292', name: 'Plextor M6Pro SSD 開箱文比賽', isSubTopic: true },
      { id: '229', name: 'AsRock Z77主機板開箱賞(完結)', isSubTopic: true },
      { id: '252', name: 'Ducky Zero DK2108 試用徵文', isSubTopic: true },
      { id: '255', name: 'WD Connected to Life 口號創作比賽', isSubTopic: true },
      { id: '260', name: '協助美女挑選 Plextor SSD', isSubTopic: true },
      { id: '264', name: 'CM女郎「邊個夠佢靚」攝影比賽', isSubTopic: true },
      { id: '265', name: 'WD Computex2013 大激賞', isSubTopic: true },
      { id: '278', name: 'ANTEC TruePower Classic 550W 開箱文專區', isSubTopic: true },
      { id: '280', name: 'WD Black2雙硬碟試用體驗」', isSubTopic: true },
      { id: '283', name: 'XFX R9 系列 Benchmark 競猜活動', isSubTopic: true },
      { id: '293', name: 'GALAX GTX970 / 980 開箱文分享', isSubTopic: true },
      { id: '306', name: 'Synology RT1900ac 試用評測', isSubTopic: true },
      { id: '231', name: '我的 Antec 電源供應器包裝盒設計(完結)', isSubTopic: true },
      { id: '253', name: 'Antec 產品聖誕寫真大激賞', isSubTopic: true },
      { id: '257', name: 'GALAXY 送你全新3D Mark 序號', isSubTopic: true },
      { id: '267', name: 'WD 包裝盒環保設計比賽', isSubTopic: true },
      { id: '279', name: 'NVIDIA SHIELD 體驗會分享區', isSubTopic: true },
      { id: '281', name: 'Plextor M6S 雙重賞', isSubTopic: true },
      { id: '284', name: 'ASUS 主機板至尊十年霸', isSubTopic: true },
      { id: '289', name: '「 ASUS ROG Insight 2014 」分享活動專區', isSubTopic: true },
      { id: '238', name: 'Inno3D GAME PACK 開箱文(已完結)', isSubTopic: true },
      { id: '266', name: 'WD My Book Live 個人雲端 "智"幫手', isSubTopic: true },
      { id: '269', name: 'Antec GX700 試用大激賞', isSubTopic: true },
      { id: '282', name: 'ASUS Tech Forum 體驗會分享', isSubTopic: true },
      { id: '290', name: 'Inno3D iChill 9 系繪圖卡開箱分享', isSubTopic: true },
      { id: '239', name: 'Philips 揚聲器、耳機使用分享', isSubTopic: true },
      { id: '275', name: 'NVIDIA SHIELD 體驗分享', isSubTopic: true },
      { id: '291', name: 'ASUS STRIX Techday2015徵文活動專區', isSubTopic: true },
      { id: '241', name: 'HKEPC足球挑戰賽', isSubTopic: true },
      { id: '244', name: 'Plextor 「 M5 Pro 系列發佈會後感」分享', isSubTopic: true },
      { id: '247', name: 'ZOTAC 「開箱文」分享', isSubTopic: true },
      { id: '332', name: 'ASUSTOR AS6302T ．開箱文提交專區', isSubTopic: false },
      { id: '331', name: 'ASUSTOR AS4004T．開箱文提交專區', isSubTopic: false },
      { id: '333', name: 'Synology MR2200ac 開箱文開箱文試用體驗', isSubTopic: false },
      { id: '214', name: 'ADATA SSD + WareMax Cache HybridDrive 效能試用報告', isSubTopic: true },
      { id: '220', name: '[QNAP 3.6 韌體應用方案] 徵文比賽', isSubTopic: true },
      { id: '144', name: 'OCZ Vertex 3 / Agility 3問題處理區', isSubTopic: true },
      { id: '193', name: 'OCZ Vertex 2 SSD Master 比賽專區 - Performance Master', isSubTopic: true },
      { id: '194', name: 'OCZ Vertex 2 SSD Master 比賽專區 - Tips Master', isSubTopic: true },
      { id: '213', name: 'HKEPC會員試用Gadmei T820', isSubTopic: true },
      { id: '287', name: 'and M811 開發及分享專區', isSubTopic: false },
      { id: '208', name: '日本地震賑災義賣', isSubTopic: false },
    ]
    const blIds = blackList.map((it) => it.id)
    const $ = html.getCheerio()

    return $('#srchfid optgroup option')
      .map((i, elem) => {
        const source = $(elem)
        const id = source.attr('value')
        const name = source.text()
        const trimmedName = name.trim()
        const isSubTopic = trimmedName.length < name.length
        return {
          id,
          name: trimmedName,
          isSubTopic,
        }
      })
      .get()
      .filter(({ id }) => blIds.indexOf(id) === -1)
  }

  static postListHtmlToPostListPage(html, pageNum) {
    const $ = html.getCheerio()

    // only work for latest
    const searchId = URLUtils.getQueryVariable($('.pages_btns .pages a').first().attr('raw-href'), 'searchid')

    const titles = $('#nav').text().split('»')
    const topicName = titles[titles.length - 1]
    const subTopicList = $('#subforum table h2 a')
      .map((i, elem) => {
        const obj = $(elem)
        const name = obj.text()
        const id = URLUtils.getQueryVariable(obj.attr('raw-href'), 'fid')
        return {
          id,
          name,
        }
      })
      .get()

    const postCategories = $('.threadtype a')
      .map((i, elem) => {
        const obj = $(elem)
        return {
          id: URLUtils.getQueryVariable(obj.attr('raw-href'), 'typeid'),
          name: obj.text(),
        }
      })
      .get()

    // only extract the number
    const pageNumSource = $('.pages_btns .pages a')

    const pageNumArr = pageNumSource
      .map((i, elem) => $(elem).text())
      .get()
      .map((e) => e.match(/\d/g)) // array of string with digit
      .filter((e) => e != null) // filter null value
      .map((e) => parseInt(e.join(''))) // join the array and parseInt

    const totalPageNum = pageNumArr.length === 0 ? 1 : Math.min(Math.max(...pageNumArr), 1000)

    const posts = $('.threadlist table tbody')
      .map((i, elem) => {
        const htmlId = $(elem).attr('id')

        const postSource = $(elem)
        // fall back for latest postUrl finding
        const postUrl =
          postSource.find('tr .subject span a').attr('raw-href') ||
          /* latest post */ postSource.find('tr .subject > a').attr('raw-href')
        const postTitleImgUrl = postSource.find('tr .folder img').attr('raw-src')
        const topicId =
          URLUtils.getQueryVariable(postUrl, 'fid') ||
          URLUtils.getQueryVariable(postSource.find('.forum a').attr('raw-href'), 'fid')

        return {
          id: URLUtils.getQueryVariable(postUrl, 'tid'),
          topicId,
          tag: postSource.find('tr .subject em a').text() || postSource.find('.forum a').text(),
          name:
            postSource.find('tr .subject span[id^=thread_] a ').text() || postSource.find('tr .subject > a ').text(),
          lastPost: {
            name: postSource.find('tr .lastpost cite a').text(),
            timestamp:
              postSource.find('tr .lastpost em a span').attr('title') || postSource.find('tr .lastpost em a').text(),
          },
          author: {
            id: URLUtils.getQueryVariable(postSource.find('tr .author a').attr('raw-href'), 'uid'),
            name: postSource.find('tr .author a').text(),
          },
          count: {
            view: postSource.find('tr .nums em').text(),
            reply: postSource.find('tr .nums strong').text(),
          },
          publishDate: postSource.find('tr .author em').text(),
          pageNum,
          isSticky: htmlId ? htmlId.startsWith('stickthread') : false,
          isRead: postTitleImgUrl ? postTitleImgUrl.indexOf('new') > 0 : false,
          isLock: postTitleImgUrl ? postTitleImgUrl.indexOf('lock') > 0 : false,
        }
      })
      .get()

    return {
      searchId,
      totalPageNum,
      subTopicList,
      categories: postCategories,
      posts: posts.filter((_) => _.id && _.name),
      topicName,
      pageNum,
    }
  }

  /**
   *
   * @param html HKEPCHtml
   * @param opt {postId, page}
   * @returns {*}
   */
  static postHtmlToPost(html, opt) {
    const { postId, page } = opt

    const $ = html.getCheerio()

    // render the basic information first
    const pageBackLink = $('.forumcontrol .pageback a').attr('raw-href')

    const topicId = URLUtils.getQueryVariable(pageBackLink, 'fid')

    const isLock = !$('.replybtn').text()

    const postTitle = html.getTitle()

    const chiFullWidthCharCount = matchCount(
      postTitle,
      /[\uff00-\uff60]|[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/gu
    )
    const engCharacterCount = matchCount(postTitle, /[0-9]|[a-z]|[-!$%^&*()_+|~=`{}[\]:";'<>?,./\s]/gi)

    console.log('word count', { chiFullWidthCharCount, engCharacterCount })

    const isLongTitle = chiFullWidthCharCount * 2 + engCharacterCount >= 50

    const topicStr = html.getEPCTopicFromTitle()

    const topicCategory = $('#threadtitle h1 a').text().replace(/[[\]]/g, '')

    const pageNumSource = $('.forumcontrol .pages a, .forumcontrol .pages strong')

    const pageNumArr = pageNumSource
      .map((i, elem) => $(elem).text())
      .get()
      .map((e) => e.match(/\d/g)) // array of string with digit
      .filter((e) => e != null) // filter null value
      .map((e) => parseInt(e.join(''))) // join the array and parseInt

    const totalPageNum = pageNumArr.length === 0 ? 1 : Math.max(...pageNumArr)

    const messages = $('#postlist > div')
      .filter((i, elem) => {
        // fix HKEPC server rendering bug
        return elem.children.length > 0
      })
      .map((i, elem) => {
        const postSource = $(elem)
        const hasEdit = !!postSource.find('a.editpost').text()

        const content =
          postSource.find('.postcontent > .defaultpost > .postmessage > .t_msgfontfix') ||
          postSource.find('.postcontent > .defaultpost > .postmessage')

        content.find('#threadtitle').remove()
        content.find('.useraction').remove()
        content.find('blockquote').attr('ng-click', content.find('blockquote a').attr('ng-click'))
        content.find('blockquote a').attr('ng-click', '')
        content
          .find('blockquote img')
          .html('<div class="message-resolve"><i class="ion-ios-search-strong"></i> 點擊查看原文</div>')

        // auto add embedded youtube before the link
        content.find('a[youtube-embed]').each((i, e) => {
          const elm = $(e)
          elm.before(elm.attr('youtube-embed'))
        })

        const rank = postSource.find('.postauthor > p > img').attr('alt')

        const avatarImage = postSource.find('.postauthor .avatar img')

        // processed by general html (isAutoLoadImage features)
        const avatarImageUrl = avatarImage.attr('image-lazy-src')
        const pstatus = content.find('.pstatus').text()

        return {
          id: postSource.find('table').attr('id').replace('pid', ''),
          pos: postSource.find('.postinfo strong a em').text(),
          createdAt:
            postSource.find('.posterinfo .authorinfo em span').attr('title') ||
            postSource.find('.posterinfo .authorinfo em').text().replace('發表於 ', ''),
          pstatus,
          content: content.html(),
          type: 'POST_MESSAGE',
          hasEdit,
          post: {
            id: postId,
            topicId,
            title: postTitle,
            page,
          },
          author: {
            rank: rank ? rank.replace('Rank: ', '') : 0,
            image: avatarImageUrl,
            uid: URLUtils.getQueryVariable(postSource.find('.postauthor a').attr('raw-href'), 'uid'),
            name: postSource.find('.postauthor > .postinfo').text().trim(),
          },
        }
      })
      .get()

    return {
      title: postTitle,
      isLongTitle,
      id: postId,
      topicId,
      topicStr,
      topicCategory,
      totalPageNum,
      messages,
      isLock,
    }
  }

  static userProfileHtmlToUserProfile(html, uid) {
    const $ = html.getCheerio()
    const contentSource = $('#profilecontent')
    const image = $('.avatar > img').attr('raw-src')
    const rank = (contentSource.find('.lightlink img').attr('alt') || '').replace('Rank: ', '')
    const name = contentSource.find('#profilecontent .itemtitle > h1').text()
    return {
      uid,
      rank,
      name,
      image,
      content: contentSource.html(),
    }
  }

  static postHtmlToFindMessageResult(html, opt) {
    const { messageId, postId, page } = opt

    const result = Mapper.postHtmlToPost(html, { postId, page })
    const $ = html.getCheerio()
    const pageNumArr = $('.pages strong')
      .map((i, elem) => $(elem).text())
      .get()
      .map((e) => e.match(/\d/g)) // array of string with digit
      .filter((e) => e != null) // filter null value
      .map((e) => parseInt(e.join(''))) // join the array and parseInt

    const currentPage = pageNumArr.length === 0 ? 1 : Math.max(...pageNumArr)

    return {
      currentPage,
      message: result.messages.filter((_) => parseInt(_.id) === parseInt(messageId))[0],
    }
  }

  static myPost(html, opt) {
    const $ = html.getCheerio()
    const formSource = $('.datalist > form')
    const relativeUrl = formSource.attr('action')
    const actionUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&inajax=1`

    const hiddenFormInputs = {}
    formSource
      .find("input[type='hidden']")
      .map((i, elem) => {
        const k = $(elem).attr('name')
        const v = $(elem).attr('value')

        hiddenFormInputs[k] = encodeURIComponent(v)
        return v
      })
      .get()

    formSource
      .find("button[type='submit']")
      .map((i, elem) => {
        const k = $(elem).attr('name')
        const v = $(elem).attr('value')

        hiddenFormInputs[k] = encodeURIComponent(v)
        return v
      })
      .get()

    const pageNumSource = $('.pages a, .pages strong')

    const pageNumArr = pageNumSource
      .map((i, elem) => $(elem).text())
      .get()
      .map((e) => e.match(/\d/g)) // array of string with digit
      .filter((e) => e != null) // filter null value
      .map((e) => parseInt(e.join(''))) // join the array and parseInt

    const totalPageNum = pageNumArr.length === 0 ? 1 : Math.max(...pageNumArr)

    const posts = $('.datalist table > tbody > tr')
      .map((i, elem) => {
        const postSource = $(elem)

        return {
          post: {
            id: postSource.find('input.checkbox').attr('value'),
            title: postSource.find('th a').text(),
            url: postSource.find('th a').attr('href'),
          },
          topic: {
            url: postSource.find('.forum a').attr('href'),
            title: postSource.find('.forum a').text() || postSource.find('td.forum').text(),
          },
          status: postSource.find('.nums').text(),
          lastpost: {
            by: postSource.find('.lastpost cite a').text() || postSource.find('.lastpost cite').text(),
            timestamp:
              postSource.find('.lastpost > em > a > span').attr('title') ||
              postSource.find('.lastpost > em > a').text() ||
              postSource.find('.lastpost > em > span').text() ||
              postSource.find('.lastpost > em').text() ||
              0,
          },
        }
      })
      .get()
      .filter((it) => it.post.title)

    return {
      totalPageNum,
      posts,
      actionUrl,
      hiddenFormInputs,
    }
  }

  static chatList(html, opt) {
    const $ = html.getCheerio()

    const pageNumSource = $('.pages a, .pages strong')

    const pageNumArr = pageNumSource
      .map((i, elem) => $(elem).text())
      .get()
      .map((e) => e.match(/\d/g)) // array of string with digit
      .filter((e) => e != null) // filter null value
      .map((e) => parseInt(e.join(''))) // join the array and parseInt

    const totalPageNum = pageNumArr.length === 0 ? 1 : Math.max(...pageNumArr)

    const chats = $('.pm_list li')
      .map((i, elem) => {
        const chatSource = $(elem)

        const avatarUrl = chatSource.find('.avatar img').attr('raw-src')
        const summary = chatSource.find('.summary').text()
        const username = chatSource.find('.cite cite a').text()
        const isRead = chatSource.find('.cite img').attr('alt') !== 'NEW'

        chatSource.find('cite').remove()
        const date = chatSource.find('.cite').text()

        const id = URLUtils.getQueryVariable(chatSource.find('a.avatar').attr('raw-href'), 'uid')
        return {
          id,
          avatarUrl,
          summary,
          username,
          date,
          isRead,
        }
      })
      .get()

    return {
      chats,
      totalPageNum,
    }
  }

  static chatDetails(html, opt) {
    const $ = html.getCheerio()
    const parseChat = (chatSource, isSelf) => {
      const avatarUrl = chatSource.find('.avatar img').attr('raw-src')
      const content = chatSource.find('.summary').html()
      const username = chatSource.find('.cite cite').text()

      chatSource.find('cite').remove()

      const date = chatSource.find('.cite').text()

      const id = URLUtils.getQueryVariable(chatSource.find('a.avatar').attr('raw-href'), 'uid')

      return {
        id,
        avatarUrl,
        content,
        username,
        date: date.trim(),
        isSelf,
      }
    }
    const messages = $('.pm_list li.s_clear')
      .map((i, elem) => {
        const isSelf = $(elem).attr('class').indexOf('self') > 0

        return parseChat($(elem), isSelf)
      })
      .get()

    const username = $('.itemtitle .left strong').text()

    // prepare the chat message
    const pmForm = $('#pmform')
    const relativeUrl = pmForm.attr('action')
    const actionUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&infloat=yes&inajax=1`

    const formSource = cheerio.load(pmForm.html())

    const hiddenFormInputs = {}

    formSource("input[type='hidden']")
      .map((i, elem) => {
        const k = formSource(elem).attr('name')
        const v = formSource(elem).attr('value')

        hiddenFormInputs[k] = encodeURIComponent(v)
        return v
      })
      .get()

    return {
      username,
      messages,
      actionUrl,
      hiddenFormInputs,
    }
  }

  static settings(html, opt) {
    const $ = html.getCheerio()
    const form = $("form[name='reg']")
    const formSource = cheerio.load(form.html() || '')
    const relativeUrl = form.attr('action')
    const actionUrl = `${HKEPC.baseForumUrl}/${relativeUrl}`

    const hiddenFormInputs = {}

    formSource("input[type='hidden'], input[checked='checked'], #editsubmit, select")
      .not("select[name='styleidnew']")
      .map((i, elem) => {
        const k = formSource(elem).attr('name')
        const v =
          formSource(elem).attr('value') || formSource(elem).find("option[selected='selected']").attr('value') || 0

        hiddenFormInputs[k] = encodeURIComponent(v)
        return v
      })
      .get()

    const forumStyles = $("select[name='styleidnew'] option")
      .map((i, elem) => {
        const obj = $(elem)
        const isSelected = obj.attr('selected') === 'selected'
        const value = obj.attr('value')
        // const name = obj.text()

        return {
          isSelected,
          value,
        }
      })
      .get()

    const [forumStyle] = forumStyles.filter((it) => it.isSelected).map((it) => it.value)
    return {
      actionUrl,
      forumStyle,
      forumStyles,
      hiddenFormInputs,
    }
  }

  static notifications(html, opt) {
    const $ = html.getCheerio()

    const pageNumSource = $('.pages a, .pages strong')

    const pageNumArr = pageNumSource
      .map((i, elem) => $(elem).text())
      .get()
      .map((e) => e.match(/\d/g)) // array of string with digit
      .filter((e) => e != null) // filter null value
      .map((e) => parseInt(e.join(''))) // join the array and parseInt

    const totalPageNum = pageNumArr.length === 0 ? 1 : Math.max(...pageNumArr)

    const notifications = $('.feed li .f_quote, .feed li .f_reply, .feed li .f_thread')
      .map((i, elem) => {
        const source = $(elem)
        return {
          isRead: source.find('img').attr('alt') !== 'NEW',
          content: source.html(),
        }
      })
      .get()

    return {
      totalPageNum,
      notifications,
    }
  }

  static epcEditorData(html, opt) {
    const $ = html.getCheerio()
    const postForm = $('#postform')
    const relativeUrl = postForm.attr('action')
    const actionUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&inajax=1`

    // ---------- Upload image preparation ----------------------------------------------
    const imgattachform = $('#imgattachform')
    const existingImages = $('img')
      .map((i, e) => {
        const img = $(e)
        const src = img.attr('raw-src')
        const rawId = img.attr('raw-id')
        const isAttachment = startsWith(src, 'https://forum.hkepc.net')
        const id = replace(rawId, 'image_', '')
        return {
          src,
          id,
          isAttachment,
        }
      })
      .get()
      .filter((existingImage) => existingImage.isAttachment)

    console.log('existingImages', existingImages)
    const attachFormSource = cheerio.load(imgattachform.html())

    const hiddenAttachFormInputs = {}

    hiddenAttachFormInputs.action = `${HKEPC.baseForumUrl}/${imgattachform.attr('action')}`

    attachFormSource("input[type='hidden']")
      .map((i, elem) => {
        const k = attachFormSource(elem).attr('name')
        const v = attachFormSource(elem).attr('value')
        hiddenAttachFormInputs[k] = encodeURIComponent(v)
        return v
      })
      .get()

    // ---------- End of Upload image preparation -----------------------------------------------

    const formSource = cheerio.load(postForm.html())
    const subTopicTypeId = formSource("#typeid > option[selected='selected']").attr('value')

    const hiddenFormInputs = {}
    formSource("input[type='hidden']")
      .map((i, elem) => {
        const k = formSource(elem).attr('name')
        const v = formSource(elem).attr('value')

        hiddenFormInputs[k] = encodeURIComponent(v)
        return v
      })
      .get()

    const edit = {
      subject: formSource('#subject').attr('value'),
      content: formSource('#e_textarea').text(),
    }

    const preText = formSource('#e_textarea').text()

    return {
      actionUrl,
      edit,
      subTopicTypeId,
      hiddenFormInputs,
      existingImages,
      hiddenAttachFormInputs,
      preText,
    }
  }

  static myReplies(html, opt) {
    const $ = html.getCheerio()

    const pageNumSource = $('.pages a, .pages strong')

    const pageNumArr = pageNumSource
      .map((i, elem) => $(elem).text())
      .get()
      .map((e) => e.match(/\d/g)) // array of string with digit
      .filter((e) => e != null) // filter null value
      .map((e) => parseInt(e.join(''))) // join the array and parseInt

    const totalPageNum = pageNumArr.length === 0 ? 1 : Math.max(...pageNumArr)

    const myreplies = $('.datalist > table > tbody > tr')
      .map((i, elem) => {
        const postSource = $(elem)

        return {
          post: {
            title: postSource.find('th a').text(),
            messageId: postSource.find('th a').attr('pid'),
            postId: postSource.find('th a').attr('ptid'),
            inAppUrl: postSource.find('th a').attr('in-app-url'),
          },
          topic: {
            url: postSource.find('.forum a').attr('href'),
            title: postSource.find('.forum a').text(),
          },
          status: postSource.find('.nums').text(),
          timestamp:
            postSource.find('.lastpost > em > span').attr('title') || postSource.find('.lastpost > em').text() || 0,
          brief: postSource.find('.lighttxt').text(),
        }
      })
      .get()

    // merge array
    for (let i = 0; i < myreplies.length; i += 2) {
      myreplies[i].brief = myreplies[i + 1].brief
    }

    const replies = myreplies.filter((x) => x.timestamp !== 0)

    return {
      replies,
      totalPageNum,
    }
  }

  static reportEditorXmlData(html, opt) {
    const $ = cheerio.load(html)
    const formSource = $('#postform')
    const relativeUrl = formSource.attr('action')
    const actionUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&inajax=1`

    const hiddenFormInputs = {}
    $("input[type='hidden']")
      .map((i, elem) => {
        const k = $(elem).attr('name')
        const v = $(elem).attr('value')

        hiddenFormInputs[k] = encodeURIComponent(v)
        return v
      })
      .get()

    // hard code that is report type
    hiddenFormInputs.type = '1'

    return {
      actionUrl,
      hiddenFormInputs,
    }
  }
}
