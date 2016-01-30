/**
 * Created by Gaplo917 on 30/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"

export class FindMessageController {

  constructor($scope, $http, messageResolver, $stateParams) {

    this.http = $http
    this.scope = $scope

    messageResolver.resolve(HKEPC.forum.findMessage($stateParams.postId,$stateParams.messageId))
    .then((data) => {
      const message = data.message

      this.post = message.post

      this.messages.push(message)
    })


  }

}