var SayText = angular.module('SayText', []);



SayText.controller('SayController', function($scope){

    $scope.saytext = '';
    $scope.sayhistory = [];
    $scope.variant="f2";
    $scope.voice="en-scottish";

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

        // lets have all tunig variables client configurable
        // (no ui for that now)
        var url = "say?text=" + encodeURIComponent($scope.saytext);
        if ($scope.pitch)
            url += "&pitch=" + encodeURIComponent($scope.pitch);
        if ($scope.speed)
            url += "&speed=" + encodeURIComponent($scope.speed);
        if ($scope.gap)
            url += "&gap=" + encodeURIComponent($scope.gap);
        if ($scope.voice)
            url += "&voice=" + encodeURIComponent($scope.voice);
       if ($scope.variant)
            url += "&variant=" + encodeURIComponent($scope.variant);

        // say it!
        $scope.say(url);

        // add to history array
        $scope.sayhistory.unshift({ url: url, text: $scope.saytext });
        // remove older elements
        while ($scope.sayhistory.length > 10) {
            $scope.sayhistory.pop();
        }
        $scope.saytext = '';
    };

    // return press should start the voice
    $scope.keyPress = function(event) {
        if (event.which == 13) {
            $scope.doSay();
        }
    };

});