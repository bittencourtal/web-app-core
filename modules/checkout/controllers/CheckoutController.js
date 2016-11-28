(function (global) {
	"use strict";

	global.squid.checkout.controller('CheckoutController', [
		'$scope', 'channelService',
		function ($scope, channelService) {

			$scope.APP_CONFIG = global.APP_CONFIG;

		}
	]);

})(window);