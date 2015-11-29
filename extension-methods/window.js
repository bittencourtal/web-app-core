(function(global){

    global.isAndroid = function(){
        var ua = navigator.userAgent.toLowerCase();
        return ua.indexOf("android") > -1;
    };

    global.isIOS = function(){
        return /iPad|iPhone|iPod/.test(global.navigator.userAgent) && !global.MSStream;
    };

})(window);