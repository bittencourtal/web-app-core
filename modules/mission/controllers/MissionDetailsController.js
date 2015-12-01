(function (global) {
    "use strict";

    global.squid.mission.controller('MissionDetailsController', [
        '$scope', '$rootScope', '$routeParams','missionService', 'participationService', '$mdDialog', '$timeout',
        function ($scope, $rootScope, $routeParams, missionService, participationService, $mdDialog, $timeout) {

            var firstLoad = true;
            $scope.mission = {};
            $scope.participations = {
                data: [],
                minId: ''
            };
            $scope.isLoading = false;
            $scope.isLoadingParticipations = false;
            $scope.menuIsOpen = false;
            $scope.timeLeft = "--";
            $scope.tooltipIsOpen = false;

            function _getMission(){
                var deferred = new $.Deferred();

                $scope.isLoading = true;

                missionService.getMissionById({
                    id: $routeParams.missionId
                }, function (result) {
                    $scope.mission = result;
                    $scope.isLoading = false;
                    deferred.resolve();
                }, function (err) {
                    $scope.isLoading = false;
                    deferred.reject();
                });

                return deferred.promise();
            }

            function _getTimeLeft(endDate){
                var now  = moment();
                var then = moment(endDate);

                var ms = moment(then,"DD/MM/YYYY HH:mm:ss").diff(moment(now,"DD/MM/YYYY HH:mm:ss"));
                var d = moment.duration(ms);
                var days = Math.floor(d.asDays());
                var hours = moment.utc(ms).format("HH");
                var minutes = moment.utc(ms).format("mm");
                var seconds = moment.utc(ms).format("ss");

                if(days <= 0)
                    return 'Encerrada';

                return days + " dias " + hours + " horas " + minutes + " minutos e " + seconds + " segundos.";
            }

            function _getMissionParticipations(){
                if($scope.isLoadingParticipations
                    || $scope.participations.data.length > 0 && !$scope.participations.minId
                    || $scope.participations.data.length == 0 && !firstLoad
                )
                    return;

                firstLoad = false;
                $scope.isLoadingParticipations = true;

                participationService.getMissionParticipations({
                    id: $scope.mission._id,
                    minId: $scope.participations.minId,
                    take: 12
                }, function(response){
                    $scope.participations.data = $scope.participations.data
                        .concat(response.data)
                        .distinct(function(c, n){
                            return c._id == n._id;
                        });
                    $scope.participations.minId = response.paginationMetadata.next ? response.paginationMetadata.next.minId : null;
                    $scope.isLoadingParticipations = false;
                }, function(){
                    $scope.isLoadingParticipations = false;
                });
            }

            function _counter(){
                setInterval(function(){
                    if(!$scope.mission || !$scope.mission.time)
                        return;
                    $scope.timeLeft = _getTimeLeft($scope.mission.time.fixedEndDate);
                    $scope.$apply();
                }, 1000);
            }

            function _init(){
                _getMission().then(function(){
                    _getMissionParticipations();
                    $rootScope.pageTitle = '#' + $scope.mission.hashtag;
                });
                _counter();
            }

            $scope.loadMoreParticipations = function(){
                _getMissionParticipations();
            };

            $scope.participate = function(ev){
                $scope.menuIsOpen = false;
                $mdDialog.show({
                    controller: 'ParticipateController',
                    templateUrl: global.APP_DIR + '/modules/mission/templates/participate.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        mission: $scope.mission
                    }
                }).then(function() {

                }, function() {

                });
            };

            $scope.challenge = function(ev){
                $scope.menuIsOpen = false;
                $mdDialog.show({
                    controller: 'ChallengeController',
                    templateUrl: global.APP_DIR + '/modules/mission/templates/challenge.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        mission: $scope.mission
                    }
                }).then(function() {

                }, function() {

                });
            };

            $scope.toggleMenu = function(){
                if(global.isAndroid())
                    $scope.menuIsOpen = !$scope.menuIsOpen;
            };

            $scope.$watch('menuIsOpen', function(newValue){
                if(!newValue){
                    $scope.tooltipIsOpen = false
                }else{
                    $timeout(function(){
                        $scope.tooltipIsOpen = true;
                    }, 250);
                }
            });

            _init();
        }]);


})(window);