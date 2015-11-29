(function (global) {
    "use strict";

    global.squid.feed.controller('FeedController', [
        '$scope', 'feedService',
        function ($scope, feedService) {

            $scope.feedList = [];
            $scope.paginationMetadata = {};
            $scope.isLoading = false;

            function _loadFeed(minId){
                var query = {};

                if(minId)
                    query.minId = minId;

                $scope.isLoading = true;

                feedService.getFeedParticipation(query, function (result) {
                    $scope.feedList = $scope.feedList.concat(result.data);
                    $scope.paginationMetadata = result.paginationMetadata;
                    $scope.isLoading = false;
                }, function (err) {
                    $scope.isLoading = false;
                });
            }

            $scope.loadMore = function () {
                if ($scope.isLoading || !$scope.paginationMetadata.next)
                    return;

                _loadFeed($scope.paginationMetadata.next.minId);
            };

            _loadFeed();

        }]);


})(window);