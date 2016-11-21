(function (global) {
    "use strict";

    global.squid.mission.controller('MissionDetailsController', [
        '$scope',
        '$rootScope',
        '$routeParams',
        'missionService',
        'participationService',
        '$mdDialog',
        '$timeout',
        'campaignService',
        '$q',
        function (
            $scope,
            $rootScope,
            $routeParams,
            missionService,
            participationService,
            $mdDialog,
            $timeout,
            campaignService,
            $q
        ) {

            var firstLoad = true;
            $scope.mission = {};
            $scope.campaignPrizes = [];
            $scope.participations = {
                data: [],
                minId: ''
            };
            $scope.isLoading = false;
            $scope.isLoadingParticipations = false;
            $scope.menuIsOpen = false;
            $scope.timeLeft = "--";
            $scope.tooltipIsOpen = false;

            function _getCampaign(campaignId) {
                var defer = $q.defer();

                campaignService.getCampaign({
                    idCampaign: campaignId
                }, defer.resolve, defer.reject);

                return defer.promise;
            }

            function _getTimeLeft(endDate) {
                var now = moment();
                var then = moment(endDate);

                var ms = moment(then, "DD/MM/YYYY HH:mm:ss").diff(moment(now, "DD/MM/YYYY HH:mm:ss"));
                var d = moment.duration(ms);
                var days = Math.floor(d.asDays());
                var hours = moment.utc(ms).format("HH");
                var minutes = moment.utc(ms).format("mm");
                var seconds = moment.utc(ms).format("ss");

                if (days <= 0)
                    return 'Encerrada';

                return days + " dias " + hours + " horas " + minutes + " minutos e " + seconds + " segundos.";
            }

            function _notHasNextParticipationPage(){
                return $scope.participations.data.length > 0 
                        && !$scope.participations.minId 
                        || $scope.participations.data.length == 0 
                        && !firstLoad;
            }

            function _getMissionParticipations(campaignId) {
                if ($scope.isLoadingParticipations || _notHasNextParticipationPage())
                    return;

                firstLoad = false;
                $scope.isLoadingParticipations = true;

                participationService.getMissionParticipations({
                    id: campaignId,
                    minId: $scope.participations.minId,
                    take: 12,
                    status: 'approved'
                }, function (response) {
                    $scope.participations.data = $scope.participations.data
                        .concat(response.data)
                        .distinct(function (c, n) {
                            return c._id == n._id;
                        });
                    $scope.participations.minId = response.paginationMetadata.next ? response.paginationMetadata.next.minId : null;
                    $scope.isLoadingParticipations = false;
                }, function () {
                    $scope.isLoadingParticipations = false;
                });
            }

            function _initCounter() {
                setInterval(function () {
                    if (!$scope.mission || !$scope.mission.time)
                        return;
                    $scope.timeLeft = _getTimeLeft($scope.mission.time.fixedEndDate);
                    $scope.$apply();
                }, 1000);
            }

            function _openParticipateDialog(ev) {
                $mdDialog.show({
                    controller: 'ParticipateController',
                    templateUrl: global.APP_CONFIG.APP_DIR + '/modules/mission/templates/participate.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        mission: $scope.mission
                    }
                });
            }

            function _openChallengeDialog(ev) {
                $mdDialog.show({
                    controller: 'ChallengeController',
                    templateUrl: global.APP_CONFIG.APP_DIR + '/modules/mission/templates/challenge.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        mission: $scope.mission
                    }
                });
            }

            function _showLoader(){
                $scope.isLoading = true;
            }

            function _hideLoader(){
                $scope.isLoading = false;
            }

            function _hideMenu() {
                $scope.menuIsOpen = false;
            }

            function _toggleTooltip(menuIsOpen) {
                if (menuIsOpen) {
                    $timeout(function () {
                        $scope.tooltipIsOpen = true;
                    }, 250);
                    return;
                }

                $scope.tooltipIsOpen = false;
            }

            function _populateCampaign(campaign){
                $scope.mission = campaign;
            }

            function _getCampaignPrizes(campaignId){
                var defer = $q.defer();

                campaignService.getCampaignPrizes({
                    idCampaign: campaignId
                }, defer.resolve, defer.reject);

                return defer.promise;
            }

            function _populateCampaignPrizes(response){
                $scope.campaignPrizes = response.prizes;
            }

            function _getCampaignAndPopulate(){
                _showLoader();
                return _getCampaign($routeParams.missionId)
                        .then(_populateCampaign)
                        .then(_hideLoader);
            }

            function _getCampaignPrizesAndPopulate(){
                _getCampaignPrizes($routeParams.missionId)
                    .then(_populateCampaignPrizes);
            }

            function _definePageTitle(){
                $rootScope.pageTitle = '#' + $scope.mission.hashtag;
            }

            function _init() {
                _getCampaignAndPopulate().then(_definePageTitle);
                _getCampaignPrizesAndPopulate();
                _getMissionParticipations($routeParams.missionId);
                _initCounter();
            }

            $scope.loadMoreParticipations = function () {
                _getMissionParticipations($routeParams.missionId);
            };

            $scope.participate = function (ev) {
                _hideMenu();
                _openParticipateDialog(ev);
            };

            $scope.challenge = function (ev) {
                _hideMenu();
                _openChallengeDialog(ev);
            };

            $scope.toggleMenu = function () {
                if (global.isAndroid())
                    $scope.menuIsOpen = !$scope.menuIsOpen;
            };

            $scope.$watch('menuIsOpen', _toggleTooltip);

            _init();
        }
    ]);


})(window);