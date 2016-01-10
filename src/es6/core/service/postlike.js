/**
 * Created by Gaplo917 on 10/1/2016.
 */
export var postLike = {
  name: '$postlike',

  impl: ['$localstorage',function ($localstorage) {
    return {
      add: (post) =>{
        "use strict";
        let likedPosts = $localstorage.getObject("like.posts")
        console.log('likedPosts',likedPosts)

        if(Object.keys(likedPosts).length == 0){
          $localstorage.setObject("like.posts",[post])
        }
        else{
          let filteredPosts = likedPosts
              .filter((p) => p.id !== post.id || p.inAppUrl !== post.inAppUrl)

          filteredPosts.push(post)

          $localstorage.setObject("like.posts",filteredPosts)
        }
      },
      remove: (post) =>{
        "use strict";
        let likedPosts = $localstorage.getObject("like.posts")
        let filteredPosts = likedPosts
                              .filter((p) => p.id !== post.id || p.inAppUrl !== post.inAppUrl)

        $localstorage.setObject("like.posts",filteredPosts)

      },

      isLikedPost: (post) => {
        "use strict";
        let likedPosts = $localstorage.getObject("like.posts")
        return Object.keys(likedPosts).length > 0
            ? likedPosts.filter((p) => p.id == post.id && p.inAppUrl == post.inAppUrl).length == 1
            : false;
      }
    }
  }]
}