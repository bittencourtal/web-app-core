(function(){
    angular.module('mdThemeColorsDSS', [])
        .factory('mdThemeColorsDSS', ['mdThemeColors', function(mdThemeColors){
            return {
                init: function(){

                    var dictColors = [];
                    var colorCategories = Object.getOwnPropertyNames(mdThemeColors);

                    dss.values = dss.values || [];
                    dss.getKeys = function(){
                        return dss.values.select(function(v){
                            return v.key;
                        });
                    };

                    colorCategories.forEach(function(colorCategory, index){

                        var variations = Object.getOwnPropertyNames(mdThemeColors[colorCategory]);

                        variations.forEach(function(variation){
                            dictColors.push({
                                key: colorCategory + '.' + variation,
                                value: mdThemeColors[colorCategory][variation]
                            });
                        });

                    });

                    dictColors.forEach(function(color){
                        dss.setProperty(color.key, color.value);
                        dss.values.push(color);
                    });
                }
            };
        }]);
})();

