(function (global) {
    "use strict"

    function AboutCampaignDialogController($scope, $mdDialog, store) {

        $scope.TEXTS = global.APP_CONFIG.CAMPAIGNS.UNIQUE_CAMPAIGN.ABOUT.TEXTS;
        $scope.currentText = ($scope.TEXTS.length > 0) ?
            $scope.TEXTS.first() : {};

        $scope.isFirstText = function (text) {
            return $scope.TEXTS.first().ORDER == text.ORDER;
        };

        $scope.isLastText = function (text) {
            return $scope.TEXTS.last().ORDER == text.ORDER;
        };

        $scope.isCurrentText = function (text) {
            return $scope.currentText.ORDER == text.ORDER;
        };

        $scope.back = function () {
            var _previousText = $scope.TEXTS.first(function (text) {
                return text.ORDER < $scope.currentText.ORDER;
            });
            $scope.currentText = !!_previousText ? _previousText : $scope.currentText;
        };

        $scope.next = function () {
            var _nextText = $scope.TEXTS.first(function (text) {
                return text.ORDER > $scope.currentText.ORDER;
            });
            $scope.currentText = !!_nextText ? _nextText : $scope.currentText;
        };

        $scope.ok = function () {
            store.set('about-campaign-read', true);
            $mdDialog.hide();
        };
    }

    global.squid.campaign.controllers.AboutCampaignDialogController = AboutCampaignDialogController;
    global.squid.campaign.controller('AboutCampaignDialogController', ['$scope', '$mdDialog', 'store', AboutCampaignDialogController]);

})(window);