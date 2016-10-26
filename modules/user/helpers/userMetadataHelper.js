(function (global) {
    "use strict";

    global.squid.user.factory('userMetadataHelper', ['store', function (store) {

        function _getProfile() {
            return store.get('profile');
        }

        function _termsIsAccepted() {
            var userMetadata = _getUserMetadata();
            return !userMetadata ? false : userMetadata.acceptedTerms;
        }

        function _getUserMetadata() {
            var userProfile = _getProfile();

            if (!userProfile || !userProfile.user_metadata || !userProfile.user_metadata.infos)
                return null;

            return userProfile.user_metadata.infos.first(function (userMetadata) {
                return userMetadata.channelId == global.APP_CONFIG.APP_ID();
            });
        }

        return {
            getProfile: _getProfile,
            getUserMetadata: _getUserMetadata,
            termsIsAccepted: _termsIsAccepted
        };
    }]);

})(window);