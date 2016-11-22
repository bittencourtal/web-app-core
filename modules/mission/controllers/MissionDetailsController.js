(function (global, config) {
	"use strict";

	global.squid.mission.controller('MissionDetailsController', [
		'$scope',
		'$rootScope',
		'$routeParams',
		'participationService',
		'$mdDialog',
		'$timeout',
		'channelService',
		'$q',
		function (
			$scope,
			$rootScope,
			$routeParams,
			participationService,
			$mdDialog,
			$timeout,
			channelService,
			$q
		) {

			var firstLoad = true;
			$scope.campaign = {};
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
				return channelService.getCampaign({
					resourceId: campaignId
				}).$promise;
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

				if (days < 0)
					return 'Encerrada';

				return days + " dias " + hours + " horas " + minutes + " minutos e " + seconds + " segundos.";
			}

			function _notHasNextParticipationPage() {
				return $scope.participations.data.length > 0 &&
					!$scope.participations.minId ||
					$scope.participations.data.length == 0 &&
					!firstLoad;
			}

			function _getMissionParticipations(campaignId) {
				if ($scope.isLoadingParticipations || _notHasNextParticipationPage())
					return;

				firstLoad = false;
				$scope.isLoadingParticipations = true;
				var query = {
					id: campaignId,
					minId: $scope.participations.minId,
					take: 12
				};
				if (config.ONLY_APPROVED) {
					query.status = 'approved';
				}

				participationService.getMissionParticipations(query, function (response) {
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
					if (!$scope.campaign || !$scope.campaign.time)
						return;
					$scope.timeLeft = _getTimeLeft($scope.campaign.time.fixedEndDate);
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
						mission: $scope.campaign
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
						mission: $scope.campaign
					}
				});
			}

			function _showLoader() {
				$scope.isLoading = true;
			}

			function _hideLoader() {
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

			function _populateCampaign(campaign) {
				$scope.campaign = campaign;
			}

			function _getCampaignPrizes(campaignId) {
				return channelService.getCampaignPrizes({
					resourceId: campaignId
				}).$promise;
			}

			function _populateCampaignPrizes(data) {
				$scope.campaignPrizes = data;
				$scope.allPrizesSoldOut = data.every(function (prize) {
					return !prize.hasAvailableStock;
				});
			}

			function _getCampaignAndPopulate() {
				_showLoader();
				return _getCampaign($routeParams.missionId)
					.then(_populateCampaign)
					.then(_hideLoader);
			}

			function _getCampaignPrizesAndPopulate() {
				_getCampaignPrizes($routeParams.missionId)
					.then(_populateCampaignPrizes);
			}

			function _definePageTitle() {
				$rootScope.pageTitle = '#' + $scope.campaign.hashtag;
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


})(window, window.APP_CONFIG.CAMPAIGNS);