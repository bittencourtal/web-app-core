(function(global) {
    "use strict";
    global.squid.mission.controller('ActiveMissionController', ['$scope', 'feedService', '$location',
        function($scope, feedService, $location) {
            $scope.isLoading = false;

            (function() {
                $scope.isLoading = true;

                feedService.getMissionsActive({}).$promise
                    .then(function(result) {
                        if (result.data.length) {
                            var mission = result.data[0];
                            $location.path('mission/mission-details/' + mission._id)
                        }
                    })
                    .catch(function(err) {
                        console.log(err);
                    })
                    .then(function() {
                        $scope.isLoading = false;
                    });
            }());
        }
    ]);
})(window);
