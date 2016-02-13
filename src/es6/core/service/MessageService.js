/**
 * Created by Gaplo917 on 10/1/2016.
 */
export class MessageService {
  static get NAME() { return 'MessageService'}

  static get DI() {
    return (LocalStorageService) => new MessageService(LocalStorageService)
  }

  static get MESSAGES_LIKE_KEY() {  return 'messages.like' }

  static get MESSAGE_DRAFT() {  return 'messages.draft' }

  constructor(LocalStorageService) {
    this.localStorageService = LocalStorageService
  }

  save (liked) {
    this.localStorageService.setObject(MessageService.MESSAGES_LIKE_KEY,liked)
  }

  add (message) {
    const liked = this.getAllLikedPost()
    console.log('likedPosts',liked)

    if(Object.keys(liked).length == 0){
      this.save([message])
    }
    else{
      let filtered = liked
          .filter((msg) => msg.id !== message.id || msg.post.id !== message.post.id)

      filtered.push(message)

      this.save(filtered)
    }
  }
  remove (message) {
    const liked = this.getAllLikedPost()
    let filtered = liked
        .filter((msg) => msg.id !== message.id || msg.post.id !== message.post.id)

    this.save(filtered)

  }

  isLikedPost (message)  {
    const liked = this.getAllLikedPost()
    return Object.keys(liked).length > 0
        ? liked.filter((msg) => msg.id == message.id && msg.post.id == message.post.id).length == 1
        : false;
  }

  getAllLikedPost ()  {
    return this.localStorageService.getObject(MessageService.MESSAGES_LIKE_KEY)
  }

  saveDraft (postId,content)  {
    console.log('save Draft',postId,content)
  }

  getDraft(postId)  {
    console.log('get Draft',postId)
  }

  getAllDrafts ()  {
    console.log('getAllDrafts')
    return this.localStorageService.getObject(MessageService.MESSAGE_DRAFT)
  }
}
