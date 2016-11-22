(function (global, config) {
    "use strict";

    var _manualPausedVideos = [];

    global.squid.feed.controller('FeedController', [
        '$scope', 'feedService', '$element', '$timeout', '$q',
        function ($scope, feedService, $element, $timeout, $q) {

            $scope.feedList = [];
            $scope.paginationMetadata = {};
            $scope.isLoading = false;

            function _autoPlayVideosOnScreen() {
                var videos = $($element).find('video').not("[autoplay='autoplay']");
                var tolerancePixel = 80;

                function _hasPausedManualy(video){
                    return _manualPausedVideos.any(function(manualPausedVideo){
                        return manualPausedVideo.currentSrc == video.currentSrc;
                    });
                }

                function _playVideo(video){
                    if(_hasPausedManualy(video))
                        return;

                    video.play();
                }

                function _videoIsVisible(scrollTop, yBottomMedia, scrollBottom, yTopMedia){
                    return scrollTop < yBottomMedia && scrollBottom > yTopMedia;
                }

                function _checkMedia() {
                    var scrollTop = $(window).scrollTop() + tolerancePixel;
                    var scrollBottom = $(window).scrollTop() + $(window).height() - tolerancePixel;

                    videos.each(function (index, el) {
                        var yTopMedia = $(this).offset().top;
                        var yBottomMedia = $(this).height() + yTopMedia;
                        var $video = $(this).get(0);

                        if (_videoIsVisible(scrollTop, yBottomMedia, scrollBottom, yTopMedia))
                            _playVideo($video);
                        else
                            $video.pause();
                    });
                }

                $(document).unbind('scroll');
                $(document).on('scroll', _checkMedia);
            }

            function _handleVideoEvents() {
                var $videos = $($element).find('video');

                function _attachVideoEvent(index, $video) {
                    var $card = $($video).closest('.card');
                    $video.onplay = function () {
                        $card.addClass('video-playing');
                    };

                    $video.onpause = function () {
                        $card.removeClass('video-playing');
                    };
                }

                $.each($videos, _attachVideoEvent);
            }

            function _attachEvents(){
                var defer = $q.defer();

                $timeout(function(){
                    _handleVideoEvents();
                    _autoPlayVideosOnScreen();
                    defer.resolve();
                }, 100);

                return defer.promise;
            }

            function _populateFeedList(result){
                var defer = $q.defer();

                $scope.feedList = $scope.feedList.concat(result.data);
                $scope.paginationMetadata = result.paginationMetadata;
                defer.resolve();

                return defer.promise;
            }

            function _stopLoading(){
                $scope.isLoading = false;
            }

            function _loadFeed(minId){
                $scope.isLoading = true;

                _getFeed(minId)
                    .then(_populateFeedList)
                    .then(_attachEvents)
                    .then(_stopLoading);
            }

            function _getFeed(minId) {
                var defer = $q.defer();
                var query = { };

                if (config.ONLY_APPROVED) {
                    query.status = 'approved';
                }
                if (minId)
                    query.minId = minId;

                feedService.getFeedParticipation(query, defer.resolve, defer.reject);

                return defer.promise;
            }

            $scope.getCardClass = function (feedItem) {
                var objClass = {};
                objClass['card-feed-' + feedItem.mediaType] = true;

                return objClass;
            }

            $scope.playVideo = function ($event, feedItem) {
                var $video = $($event.currentTarget).get(0);
                if (!$video)
                    return;

                if ($video.paused)
                    return $video.play();

                _manualPausedVideos.push($video);
                _manualPausedVideos = _manualPausedVideos.distinct(function(v1, v2){
                    return v1.currentSrc == v2.currentSrc;
                });
                return $video.pause();
            };

            $scope.loadMore = function () {
                if ($scope.isLoading || !$scope.paginationMetadata.next)
                    return;

                _loadFeed($scope.paginationMetadata.next.minId);
            };

            _loadFeed();
        }]);

})(window, window.APP_CONFIG.CAMPAIGNS);
