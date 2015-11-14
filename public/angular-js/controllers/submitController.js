myApp.controller('submitController', ['$scope', 'multipartForm', function($scope, multipartForm){
    $scope.excelFile = {};
    $scope.Submit = function(){
        var uploadUrl = '/upload';
        multipartForm.post(uploadUrl, $scope.excelFile);
    }
}]);