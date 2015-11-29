(function(global){

    global.squid.mission.controller('ParticipateController',
        ['$scope', 'mission', '$mdDialog',
            function($scope, mission, $mdDialog){

                $scope.mission = mission;

                $scope.isMobile = global.isIOS() || global.isAndroid();

                $scope.openInstagram = function(){

                    if(global.isIOS())
                        window.location = 'instagram://camera';
                    else
                        window.location = 'intent://instagram.com/_n/mainfeed/#Intent;package=com.instagram.android;scheme=https;end';

                    $mdDialog.hide();
                };

                $scope.closeModal = function(){
                    $mdDialog.hide();
                };

            }]);

})(window);