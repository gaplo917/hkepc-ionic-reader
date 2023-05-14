/**
 * Created by Gaplo917 on 10/1/2016.
 */
export class MessageService {
  static get NAME() {
    return 'MessageService'
  }

  static get DI() {
    return (LocalStorageService) => new MessageService(LocalStorageService)
  }

  static get MESSAGES_LIKE_KEY() {
    return 'messages.like'
  }

  static get MESSAGE_DRAFT() {
    return 'messages.draft'
  }

  constructor(LocalStorageService) {
    this.localStorageService = LocalStorageService
  }

  save(liked) {
    this.localStorageService.setObject(MessageService.MESSAGES_LIKE_KEY, liked)
  }

  add(message) {
    this.getAllLikedPost().subscribe((liked) => {
      console.log('likedPosts', liked)

      if (Object.keys(liked).length === 0) {
        this.save([message])
      } else {
        const filtered = liked.filter((msg) => msg.id !== message.id || msg.post.id !== message.post.id)

        filtered.push(message)

        this.save(filtered)
      }
    })
  }

  remove(message) {
    this.getAllLikedPost().subscribe((liked) => {
      const filtered = liked.filter((msg) => msg.id !== message.id || msg.post.id !== message.post.id)

      this.save(filtered)
    })
  }

  isLikedPost(message) {
    return this.getAllLikedPost().map((liked) => {
      return Object.keys(liked).length > 0
        ? liked.filter((msg) => msg.id === message.id && msg.post.id === message.post.id).length === 1
        : false
    })
  }

  getAllLikedPost() {
    return this.localStorageService.getObject(MessageService.MESSAGES_LIKE_KEY).map((data) => data || [])
  }
}
