/**
 * Created by Gaplo917 on 30/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"

export class FindMessageController {

  constructor($scope, $http, messageResolver, $stateParams) {

    this.http = $http
    this.scope = $scope

    messageResolver.resolve(`http://proxy.ionic-reader.xyz/www.hkepc.com/forum/redirect.php?goto=findpost&pid=${$stateParams.messageId}&ptid=${$stateParams.postId}`)
    .then((data) => {
      const message = data.message

      this.post = message.post

      this.messages.push(message)
    })


  }

}