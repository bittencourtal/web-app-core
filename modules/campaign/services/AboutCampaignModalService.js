(function (global) {

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    var _campaignControllers = global.squid.campaign.controllers;

    global.squid.login.factory('AboutCampaignModalService', ['$q', 'store', '$mdDialog',
        function ($q, store, $mdDialog) {

            function _openDialog() {
                var defer = $q.defer();

                $mdDialog.show({
                    controller: _campaignControllers.AboutCampaignDialogController,
                    templateUrl: global.APP_CONFIG.APP_DIR + '/modules/campaign/views/about-campaign-dialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    escapeToClose: false
                }).then(defer.resolve, defer.reject);

                return defer.promise;
            }

            function _aboutCampaignIsRead() {
                var _aboutCampaignRead = store.get('about-campaign-read');

                if (_aboutCampaignRead.channelId != global.APP_CONFIG.APP_ID())
                    return false;

                return _aboutCampaignRead.read;
            }

            function _storeAboutCampaignAnswer(answer) {
                store.set('about-campaign-read', {
                    channelId: global.APP_CONFIG.APP_ID(),
                    read: answer
                });
            }

            return {
                openDialog: _openDialog,
                aboutCampaignIsRead: _aboutCampaignIsRead,
                storeAboutCampaignAnswer: _storeAboutCampaignAnswer
            }
        }
    ]);

})(window);