(function(global){

    global.squid.mission.controller('ChallengeController',
        ['$scope', 'mission', '$mdDialog', 'shareService',
            function($scope, mission, $mdDialog, shareService){

                $scope.mission = mission;
                $scope.isMobile = global.isIOS() || global.isAndroid();
                $scope.urlToShare = window.location.href.replaceAll('/#', '');
                $scope.textToShare = '';
                $scope.descriptionToShare = '';

                function _parseHashtagsToSpecialCharacter(){
                    $scope.mission.shareText = $scope.mission.shareText.replaceAll('#', '%23');
                }

                function _shareMission(){
                    shareService.shareMission({
                        id: $scope.mission._id
                    });
                }

                function _closeModal(){
                    $mdDialog.hide();
                }

                $scope.share = function(){
                    _shareMission();
                    _closeModal();
                };

                $scope.closeModal = function(){
                    _closeModal();
                };

                _parseHashtagsToSpecialCharacter();
            }]);

})(window);