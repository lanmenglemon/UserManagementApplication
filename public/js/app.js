var app = angular.module('myapp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/view/login.html'
    })
    .when('/signup', {
        templateUrl: '/view/signup.html'
    })
    .when('/login', {
        templateUrl: '/view/login.html',
        controller: 'loginController'
    })
    .when('/homepage', {
        templateUrl: '/view/homepage.html',
        controller: 'logoutController',
        resolve: ['authService', function(authService) {
            return authService.checkUserStatus();
        }]
    })
    .when('/profile', {
        templateUrl:'/view/profile.html',
        controller: 'profileController',
        resolve: ['authService', function(authService) {
            return authService.checkUserStatus();
        }]
    })
    .when('/messages', {
        templateUrl:'/view/messages.html',
        controller: 'messagesController',
        resolve: ['authService', function(authService) {
            return authService.checkUserStatus();
        }]
    })
    .when('/messages/:index', {
        templateUrl:'/view/messageDetail.html',
        controller: 'messageDetailController',
        resolve: ['authService', function(authService) {
            return authService.checkUserStatus() && authService.checkMessages();
        }]
    })
});

app.directive('updateFields', function () {
    return {
        template: `
                <input ng-model="username" type="text" name="username" placeholder="Username" /><br />
                <input ng-model="password" type="text" name="password" placeholder="Password" /><br />
                <input ng-model="firstname" type="text" name="firstname" placeholder="Firstname" /><br />
                <input ng-model="lastname" type="text" name="lastname" placeholder="Lastname" /><br />
                <input ng-model="email" type="text" name="email" placeholder="Email" /><br />
                <input ng-model="phone" type="number" name="phone" placeholder="Phone" /><br />
                <input ng-model="location" type="text" name="location" placeholder="Location" /><br />
                <button type="button" ng-click="update()" >Save</button>
        `,
        restrict: 'EAC'
    };
})

app.controller('messagesController', function($scope, $http, $rootScope) {
    $scope.user = $rootScope.active_user;
    $http.get('http://localhost:3000/messages/' + $scope.user.username).then(function(resp) {
        $scope.messages = resp.data;
        $rootScope.messages = resp.data;
    });
})

app.controller('messageDetailController', function($scope, $http, $location, $rootScope, $routeParams, $window) {
    $scope.message = $rootScope.messages[$routeParams.index];
    $scope.backtomessages = function() {
        $location.path('/messages');
    }
    $scope.deletemessage = function() {
        $http.get('http://localhost:3000/deleteMessage/' + $scope.message._id).then(function(resp) {
            if (resp.data.flg) {
                alert('Delete successfully!')
                $location.path('/messages');
            }
        });
    }
    $scope.mark = function() {
        if ($scope.message.important === "0") {
            console.log("important is 0")
            $scope.imp = {
                "id": $scope.message._id,
                "important": "1"
            };
            $http.post('http://localhost:3000/mark', $scope.imp).then(function (resp) {
                if (resp.data.flg) {
                    document.getElementById('imp').outerHTML = '<button ng-click="mark()" id="imp" style="color: silver">Important</button>';
                }
            });
        } else {
            console.log("important is 1")
        }
    };
    $scope.ngShowhide = false;

    $scope.reply = function(flag) {
        if (flag) {
            $scope.ngShowhide = false;
        } else {
            $scope.ngShowhide = true;
        }
    };
    $scope.submitReply = function() {
        if ($scope.replyTxt !== "") {
            $scope.newReply = {
                "id": $scope.message._id,
                "replies": $scope.replyTxt
            };
            console.log($scope.newReply);
            $http.post('http://localhost:3000/reply', $scope.newReply).then(function (resp) {
                if (resp.data.flg) {
                    alert('Reply successfully!')
                    $window.location.reload();;
                }
            });
        }
    }

    $scope.$on('$viewContentLoaded', function(){
        var index = $location.path().slice(10);
        if ($rootScope.messages[index].important === "1") {
            document.getElementById('imp').outerHTML = '<button ng-click="mark()" id="imp" style="color: silver">Important</button>';
        }
    });
})

app.controller('profileController', function($scope, $rootScope, $location, $http) {
    $scope.user = $rootScope.active_user;

    $scope.username = $scope.user.username;
    $scope.password = $scope.user.password;
    $scope.firstname = $scope.user.firstname;
    $scope.lastname = $scope.user.lastname;
    $scope.email = $scope.user.email;
    $scope.phone = $scope.user.phone;
    $scope.location = $scope.user.location;

    $scope.update = function() {
        $scope.user.username = $scope.username;
        $scope.user.password = $scope.password;
        $scope.user.firstname = $scope.firstname;
        $scope.user.lastname = $scope.lastname;
        $scope.user.email = $scope.email;
        $scope.user.phone = $scope.phone;
        $scope.user.location = $scope.location;
        $http.post('http://localhost:3000/profileUpdate', $scope.user).then(function (resp) {
            if (resp.data.flg) {
                alert('Update successfully!')
                $location.path('/profile');
            }
        });
    }

    $scope.ngShowhide = false;
    $scope.ngShowhideFun = function(flag) {
        if (flag) {
            $scope.ngShowhide = false;
        } else {
            $scope.ngShowhide = true;
        }
    };
});

app.controller('loginController', function($scope, $rootScope, $location, $http) {
    $scope.login = function() {
        if ($scope.loginForm.username == '' || $scope.loginForm.password == '') {
            alert('Please fill!');
            return false;
        }
        
        $http.get('http://localhost:3000/userLogin/' + $scope.loginForm.username + '/' + $scope.loginForm.password)
        .then(function(resp) {
            if (!resp.data.length) {
                alert('Your username/password is not correct!');
            } else {
                $rootScope.active_user = resp.data[0];
                $location.path('/homepage');
            }
        });
    };

    $scope.gotosignup = function() {
        $location.path('/signup');
    }
});

app.controller('signupController', function($scope, $location, $http) {
    $scope.signup = function() {
        $http.post('http://localhost:3000/userSignup', $scope.signupForm).then(function (resp) {
            if (resp.data.flg) {
                alert('Sign up successfully!')
                $location.path('/login');
            }
        });
    };
    $scope.gotologin = function() {
        $location.path('/login');
    }
});

app.controller('logoutController', function($scope, $location, $http) {
    $scope.logout = function() {
        $http.get('http://localhost:3000/userLogout').then(function (resp) {
            if (resp.data.flg) {
                alert('Log out successfully!')
                $location.path('/login');
            }
        });
    };
});

app.factory('authService', function($location, $http, $q, $rootScope) {
    return {
        'checkUserStatus': function () { 
            var defer = $q.defer();
            $http.get('http://localhost:3000/checkUserStatus').then(function(resp) {
                if(resp.data[0].isLoggedIn) {
                    $rootScope.active_user = resp.data[0];
                    defer.resolve();
                } else {
                    $location.path('/login');
                    defer.reject();
                }
            });
            return defer.promise;
        },
        'checkMessages': function() {
            var defer = $q.defer();
            $http.get('http://localhost:3000/checkUserStatus').then(function(resp) {
                if(resp.data[0].isLoggedIn) {
                    $rootScope.active_user = resp.data[0];
                    $http.get('http://localhost:3000/messages/' + $rootScope.active_user.username).then(function(response) {
                        if(response.data.length !== 0) {
                            $rootScope.messages = response.data;
                            defer.resolve();
                        } else {
                            $location.path('/messages');
                            defer.reject();
                        }
                    });
                } else {
                    $location.path('/login');
                    defer.reject();
                }
            });

            return defer.promise;
        }
    }
});