import { HKEPCHtml } from './model/hkepc-html'
import Mapper from './mapper/mapper'
import cheerio from 'cheerio'
import { XMLUtils } from '../utils/xml'
import { includes } from 'lodash-es'

self.addEventListener('message', function (ev) {
  const { topic, data, currentHash, isAutoLoadImage, isXml } = ev.data

  const html = isXml
    ? cheerio.load(XMLUtils.removeCDATA(data), { xmlMode: true }).html()
    : new HKEPCHtml(cheerio.load(data))
      .removeAds()
      .processImgUrl('https://www.hkepc.com/forum')
      .processImageToLazy(isAutoLoadImage === undefined ? true : isAutoLoadImage)
      .processEpcUrl(currentHash || '')
      .processExternalUrl()

  if (!isXml) {
    self.postMessage({
      topic: 'commonInfo',
      data: html.getLoggedInUserInfo()
    })

    console.log(html.getLoggedInUserInfo())
  }

  switch (topic) {
    case 'topicList':

      self.postMessage({
        topic,
        data: Mapper.topicListHtmlToTopicList(html)
      })

      break
    case 'fullTopicListFromSearch':
      self.postMessage({
        topic,
        data: Mapper.fullTopicListFromSearchHtmlToTopicList(html)
      })
      break

    case 'postListPage':
      const pageNum = ev.data.pageNum

      self.postMessage({
        topic,
        data: Mapper.postListHtmlToPostListPage(html, pageNum)
      })

      break

    case 'postDetails':
      self.postMessage({
        topic,
        data: Mapper.postHtmlToPost(html, ev.data.opt)
      })

      break

    case 'findMessage':
      self.postMessage({
        topic,
        data: Mapper.postHtmlToFindMessageResult(html, ev.data.opt)
      })

      break
    case 'userProfile':
      self.postMessage({
        topic,
        data: Mapper.userProfileHtmlToUserProfile(html, ev.data.uid)
      })
      break

    case 'search':

      self.postMessage({
        topic,
        data: Mapper.postListHtmlToPostListPage(html, 1)
      })
      break

    case 'myPost':
      self.postMessage({
        topic,
        data: Mapper.myPost(html, ev.data.opt)
      })
      break
    case 'chatList':
      self.postMessage({
        topic,
        data: Mapper.chatList(html, ev.data.opt)
      })
      break
    case 'chatDetails':
      self.postMessage({
        topic,
        data: Mapper.chatDetails(html, ev.data.opt)
      })
      break
    case 'settings':
      self.postMessage({
        topic,
        data: Mapper.settings(html, ev.data.opt)
      })
      break
    case 'notifications':
      self.postMessage({
        topic,
        data: Mapper.notifications(html, ev.data.opt)
      })
      break
    case 'epcEditorData':
      self.postMessage({
        topic,
        data: Mapper.epcEditorData(html, ev.data.opt)
      })
      break
    case 'reportEditorXmlData':
      self.postMessage({
        topic,
        data: Mapper.reportEditorXmlData(html, ev.data.opt)
      })
      break
    case 'myReplies' :
      self.postMessage({
        topic,
        data: Mapper.myReplies(html, ev.data.opt)
      })
      break
    case 'responseContainText':
      const { text } = ev.data
      const responseText = html
      const result = includes(responseText, text)
      self.postMessage({
        topic,
        data: { responseText, result }
      })
      break

    default:
      console.log(`No special handling of topic=${topic}`)
      self.postMessage({
        topic,
        data: {}
      })
  }
})
