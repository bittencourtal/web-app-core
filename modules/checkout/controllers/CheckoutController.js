(function (global) {
	"use strict";

	global.squid.checkout.controller('CheckoutController', [
		'$scope', 'channelService',
		function ($scope, channelService) {

			$scope.checkoutList = [];
			$scope.isLoading = false;

			function _getCheckouts(minId) {
				$scope.isLoading = true;
				channelService.getSelfPoints({}).$promise
					.then(function (points) {
						return Promise.all(points.map(function (point) {
							return channelService.getCampaignPrizes({
									resourceId: point.campaign.id
								})
								.$promise
								.then(function (prizes) {
                                    var allPrizesSoldOut = prizes.every(function(prize) {
                                        return !prize.hasAvailableStock;
                                    });
									return Object.assign({}, point, {
										prizes: prizes,
                                        allPrizesSoldOut: allPrizesSoldOut,
									});
								});
						}));
					})
					.then(function (result) {
						$scope.checkoutList = result;
						$scope.isLoading = false;
					})
					.catch(function (err) {
						$scope.isLoading = false;
					});;
			}

			$scope.hasPointsAvailable = function (checkout, prize) {
				return checkout.totalAvaible >= prize.points;
			};

			_getCheckouts();

		}
	]);

})(window);