var SayText = angular.module('SayText', []);



SayText.controller('SayController', function($scope){

    $scope.saytext = '';
    $scope.sayhistory = [];

    $scope.say = function(url) {
        // play the sound
        var e = document.getElementById('say_snd');
        e.volume = 0.3;
        e.src = url;
        e.load();
        e.play();
    };

    $scope.doSay = function() {
        
        if ($scope.saytext === '') {
            return;
        }
        
        // save url
        var h = {
            url : "say?text=" + encodeURIComponent($scope.saytext),
            text : $scope.saytext
        };

        $scope.say(h.url);

        // add to array
        $scope.sayhistory.unshift(h);
        // remove older elements
        while ($scope.sayhistory.length > 10) {
            $scope.sayhistory.pop();
        }
        $scope.saytext = '';
    };

    $scope.keyPress = function(event) {
        if (event.which == 13) {
            $scope.doSay();
        }
    };
    
});