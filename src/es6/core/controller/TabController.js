/**
 * Created by Gaplo917 on 23/1/2016.
 */
export class TabController{

  constructor($scope) {
    $scope.vm = this

    $scope.$on('accountTabUpdate', (event,arg) =>{
      if(arg){
        this.login = arg
        $scope.$apply()
      }
    })
  }
}