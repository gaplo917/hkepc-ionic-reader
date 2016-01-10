/**
 * Created by Gaplo917 on 10/1/2016.
 */
export var message = {
  name: '$message',

  impl: ['$localstorage',function ($localstorage) {
    var key = 'like.messages'
    return {
      add: (message) =>{
        "use strict";
        let liked = $localstorage.getObject(key)
        console.log('likedPosts',liked)

        if(Object.keys(liked).length == 0){
          $localstorage.setObject(key,[message])
        }
        else{
          let filtered = liked
              .filter((msg) => msg.id !== message.id || msg.inAppUrl !== message.inAppUrl)

          filtered.push(message)

          $localstorage.setObject(key,filtered)
        }
      },
      remove: (message) =>{
        "use strict";
        let liked = $localstorage.getObject(key)
        let filtered = liked
                              .filter((msg) => msg.id !== message.id || msg.inAppUrl !== message.inAppUrl)

        $localstorage.setObject(key,filtered)

      },

      isLikedPost: (message) => {
        "use strict";
        let likedPosts = $localstorage.getObject(key)
        return Object.keys(likedPosts).length > 0
            ? likedPosts.filter((msg) => msg.id == message.id && msg.inAppUrl == message.inAppUrl).length == 1
            : false;
      }
    }
  }]
}