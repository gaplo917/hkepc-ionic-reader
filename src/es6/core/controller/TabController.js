/**
 * Created by Gaplo917 on 23/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import {FindMessageRequest} from "../model/find-message-request"

export class TabController{

  constructor($scope,$ionicModal,messageResolver,$stateParams,authService,ngToast) {
    this.scope = $scope
    this.scope.messageModal = $scope.$new()

    $scope.$on('accountTabUpdate', (event,arg) =>{
      if(arg){ this.login = arg }
      else if(authService.isLoggedIn()){
        ngToast.danger(`<i class="ion-alert-circled"> 你的登入認証己過期，請重新登入！</i>`)
        this.login = undefined
        authService.logout()
      }
    })

    $scope.$on('find', (event,arg) =>{
      if(arg instanceof FindMessageRequest){
        this.messageModal.show()

        messageResolver.resolve(HKEPC.forum.findMessage(arg.postId,arg.messageId))
            .then((data) => {

              this.scope.messageModal.message = data.message
              this.scope.messageModal.hide = () => this.messageModal.hide()

            })
      }

    })

    $ionicModal.fromTemplateUrl('templates/modals/find-message.html', {
      scope: $scope.messageModal
    }).then((modal) => {
      this.messageModal = modal
    })
  }


}