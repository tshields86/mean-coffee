(function () {

	angular.module('meanCoffee', ['ui.router'])
	// ui.router config
	.config([
		'$stateProvider',
		'$urlRouterProvider',
		function($stateProvider, $urlRouterProvider) {
			$stateProvider
				.state('home', {
					url: '/home',
					templateUrl: '/home.html',
					controller: 'MainCtrl',
					resolve: {
						postPromise: ['posts', function(posts) {
							return posts.getAll();
						}]
					}
				})
				.state('posts', {
					url: '/posts/{id}',
					templateUrl: '/posts.html',
					controller: 'PostsCtrl',
					resolve: {
						post: ['$stateParams', 'posts', function($stateParams,posts) {
							return posts.get($stateParams.id);
						}]
					}
				});
			$urlRouterProvider.otherwise('home');
		}
	])

	// Main controller
	.controller('MainCtrl', [ '$scope', 'posts',
	function($scope, posts){
		$scope.posts = posts.posts;

		$scope.title = '';
		$scope.addPost = function() {
			if ($scope.title.length === 0) {
				 alert('Coffee Shop is required');
					return;
			}
			posts.create({
				title: $scope.title,
				link: $scope.link,
			});
			// clear the values
			$scope.title = '';
			$scope.link = '';
		};
		$scope.deletePost = function(post) {
			posts.delete(post);
		}
		$scope.upvote = function (post) {
				//Calling the upvote() function and passing in our post
				posts.upvote(post);
		};
		$scope.downvote = function (post) {
			posts.downvote(post);
		};
	}])

	// Post controller
	.controller('PostsCtrl', [ '$scope', 'posts', 'post',
	function($scope, posts, post) {
		$scope.post = post;
		$scope.addComment = function() {
			if ($scope.body === '') {
				return;
			}
			posts.addComment(post._id, {
				body: $scope.body,
				author: 'user',
			}).success(function(comment) {
				$scope.post.comments.push(comment);
			});
			$scope.body = '';
		};
		$scope.upvote = function (comment) {
				posts.upvoteComment(post, comment);
		};

		$scope.downvote = function (comment) {
				posts.downvoteComment(post, comment);
		};
	}])

	// Angular service
	.factory('posts', ['$http', function($http){
		// service body
		var o = {
			posts: []
		};
		// get all posts
		o.getAll = function () {
				return $http.get('/posts')
					.success(function (data) {
						angular.copy(data, o.posts);
				});
		};
		// create new posts
		o.create = function (post) {
				return $http.post('/posts', post)
					.success(function (data) {
						o.posts.push(data);
				});
		};
		// upvote
		o.upvote = function (post) {
			//use express route for this post's id to add upvote to mongo model
				return $http.put('/posts/' + post._id + '/upvote')
								.success(function (data) {
										post.votes += 1;
								});
		};
		// downvote
		o.downvote = function (post) {
			return $http.put('/posts/' + post._id + '/downvote')
				.success(function(data) {
					post.votes -= 1;
				});
		};
		// get single post
		o.get = function (id) {
				return $http.get('/posts/' + id)
					.then(function (res) {
						return res.data;
				});
		};
		// delete single post
		o.delete = function(post) {
			return $http.delete('/posts/' + post._id)
				.success(function(data) {
				angular.copy(data, o.posts);
			});
		};
		// add comment
		o.addComment = function(id, comment) {
			return $http.post('/posts/' + id + '/comments', comment);
		};
		// upvote comment
		o.upvoteComment = function (post, comment) {
				return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
								.success(function (data) {
										comment.votes += 1;
								});
		};
		// downvote comment
		o.downvoteComment = function (post, comment) {
			return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote')
				.success(function (data) {
					comment.votes -= 1;
				});
		};
		return o;
	}])

})();
