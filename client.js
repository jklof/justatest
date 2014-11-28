var SayText = angular.module('SayText', []);



SayText.controller('SayController', function($scope){

    $scope.saytext = '';

    $scope.doSay = function() {
        var e = document.getElementById('say_snd');
        e.volume = 0.3;
        e.src = "say?text=" + encodeURIComponent($scope.saytext);
        e.load();
        e.play();
        $scope.saytext = '';  
    };

    $scope.keyPress = function(event) {
        if (event.which == 13) {
            $scope.doSay();
        }
    };
    
});