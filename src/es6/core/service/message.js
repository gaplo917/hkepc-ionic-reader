/**
 * Created by Gaplo917 on 10/1/2016.
 */
export var message = {
  name: '$message',

  impl: ['$localstorage',function ($localstorage) {
    const MESSAGES_LIKE_KEY = 'messages.like'
    const MESSAGE_DRAFT = 'messages.draft'

    return {
      add: (message) =>{
        "use strict";
        let liked = $localstorage.getObject(MESSAGES_LIKE_KEY)
        console.log('likedPosts',liked)

        if(Object.keys(liked).length == 0){
          $localstorage.setObject(MESSAGES_LIKE_KEY,[message])
        }
        else{
          let filtered = liked
              .filter((msg) => msg.id !== message.id || msg.inAppUrl !== message.inAppUrl)

          filtered.push(message)

          $localstorage.setObject(MESSAGES_LIKE_KEY,filtered)
        }
      },
      remove: (message) =>{
        "use strict";
        let liked = $localstorage.getObject(MESSAGES_LIKE_KEY)
        let filtered = liked
                              .filter((msg) => msg.id !== message.id || msg.inAppUrl !== message.inAppUrl)

        $localstorage.setObject(MESSAGES_LIKE_KEY,filtered)

      },

      isLikedPost: (message) => {
        "use strict";
        let likedPosts = $localstorage.getObject(MESSAGES_LIKE_KEY)
        return Object.keys(likedPosts).length > 0
            ? likedPosts.filter((msg) => msg.id == message.id && msg.inAppUrl == message.inAppUrl).length == 1
            : false;
      },

      saveDraft: (postId,content) => {
        "use strict";
        console.log('save Draft',postId,content)
      },

      getDraft:(postId) => {
        "use strict";
        console.log('get Draft',postId)
      },

      getAllDrafts: () => {
        "use strict";
        console.log('getAllDrafts')
        return $localstorage.getObject(MESSAGE_DRAFT)
      }
    }
  }]
}