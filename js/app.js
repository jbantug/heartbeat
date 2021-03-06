var videoTrackApp = angular.module('videoTracker',['ui-filter','trim-filter','text-module','$strap.directives','ngSanitize','ngUpload','ngResource','ui.bootstrap','ui.bootstrap.tpls','ui.bootstrap.rating','ui.jq']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.	
  	when('/dashboard', {
      templateUrl: 'templates/dashboard.php',
      controller: dashboardController }).
	when('/rank', {
      templateUrl: 'templates/db_view.php',
      controller: dbViewController }).
	when('/rank/:keyword', {
      templateUrl: 'templates/db_view.php',
      controller: dbViewController }).
	when('/play/:videoId', {
      templateUrl: 'templates/play.php',
      controller: playController }).
	when('/play/:videoId/:mode', {
      templateUrl: 'templates/play.php',
      controller: playController }).
	when('/about', {
      templateUrl: 'templates/about.php',
      controller: videoTrackController }).
	when('/contact', {
      templateUrl: 'templates/contact.php',
      controller: videoTrackController }).
	when('/settings', { 
      templateUrl: 'templates/settings.php',
      controller: settingsController }).
	when('/settings/ratings', { 
      templateUrl: 'templates/ratings.php',
      controller: settingsController }).
    when('/settings/upload', { 
      templateUrl: 'templates/uploaddata.php',
      controller: settingsController }).
	when('/pageNotFound', { 
      templateUrl: 'templates/404.php',
      controller: videoTrackController }).
	when('/comments', { 
      templateUrl: 'templates/comments.php',
      controller: videoTrackController }). 
	when('/mychannel', { 
      templateUrl: 'templates/channel.php',
      controller: channelController }).
	when('/admin', {
      templateUrl: 'templates/admin.php',
      controller: adminController }). 
    otherwise({
      redirectTo: 'dashboard'});
	  
	$locationProvider
		  .html5Mode(false)
		  .hashPrefix('!');
}]);

videoTrackApp.factory("DataService", function() {
	var myYtLink_Video = "http://www.youtube.com/watch?v=";
	var myYtLink_Channel = "http://www.youtube.com/channel/";
	var myYtLink_User = "http://www.youtube.com/user/";
	var savedJSON = [];
	var keyword = "";
	var arr = []
  return {
	ytLink_video: myYtLink_Video
	,ytLink_channel: myYtLink_Channel
	,ytLink_user: myYtLink_User
	,savedData : savedJSON
	,getKeyword: function () {
			return keyword;
		}
	,setKeyword: function(value) {
			keyword = value;
		}
	,rateVideoArr : arr
  };
});
videoTrackApp.factory('sessionService', function($http,$q) {
   return {
        getCurrentUser: function () {
            var deferred = $q.defer();
            $http.post('model/session_model.php', {useremail:''}).success(function(data) {
                deferred.resolve(data);
            });
            return deferred.promise;
        }
        ,getCurrentChannel: function () {
            var deferred = $q.defer();
            $http.post('model/session_model.php', {channel:true}).success(function(data) {
                deferred.resolve(data);
            });
            return deferred.promise;
        }
        ,setSessionVariable: function (key,value) {
            var deferred = $q.defer();
            $http.post('model/session_model.php', {createVariable:true,key:key,value:value}).success(function(data) {
                deferred.resolve(data);
            });
            return deferred.promise;
        }
        ,getByKey: function (key) {
            var deferred = $q.defer();
            $http.post('model/session_model.php', {key:key}).success(function(data) {
                deferred.resolve(data);
            });
            return deferred.promise;
        }
    };
});
videoTrackApp.factory('youtubeService', function($http,$q) {
   return {
        getDetails: function (videoIds,idx) {
            var deferred = $q.defer();
            // console.log("Getting "+videoIds+"'s video info");
            $http.post('apirequest/youtube-api-video.php', {ids:videoIds}).success(function(data) {
            	// console.log("Get YouTube Video Info");
            	// console.log(data);
				data.index = idx;
                deferred.resolve(data);
            });
            return deferred.promise;
        }
        ,getVideosFromChannel: function () {
            var deferred = $q.defer();
            $http.post('apirequest/youtube-api-channel.php', {getChannelPlaylist:true}).success(function(data) {            
                deferred.resolve(data);
            });
            return deferred.promise;
        }
        ,getChannelUsername: function (id) {
            var deferred = $q.defer();
            $http.get('https://gdata.youtube.com/feeds/api/users/'+id+'?alt=json').success(function(data) {
            	console.log("getChannelUsername");
            	console.log(data);
            	var username = data.entry.yt$username.$t;
                deferred.resolve(username);
            });
            return deferred.promise;
        }
    };
});
videoTrackApp.factory('databaseService', function($http,$q) {
	return {
        saveVideos: function (values,wrapped) {
			// console.log("Save Videos Called.");
			var deferred = $q.defer();
			angular.forEach(values,function(value){
				if(wrapped){
					value = value[0];
				}
				// console.log(value);
				var arr = [];
				// console.log(value.snippet);
				arr.push({
					"videoId":value.id
					// ,"channelId":value.snippet.channelId
					,"rating":value.ratings
					,"note":value.note
					,"username":value.name
					,"useremail":value.email
					,"snippet":value.snippet
					,"statistics":value.statistics
					,"dashboardInfo":value.dashboardInfo
				});		
				// console.log("Saving...");
				
				$http.post('model/videorating_model_new.php', {videosArr:arr,mode:"upload"}).success(function(data) {							
					console.log("arr");					
					deferred.resolve(data);
				});
			});
			return deferred.promise;
		}
		,getVideo: function(videoId) {
			var deferred = $q.defer();						
			$http.post('model/videorating_model_new.php', {vid:videoId}).success(function(data) {							
				// console.log("Get Video: ");
				// console.log(data.length);			
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,getRatedVideo: function(limitOf) {
			var deferred = $q.defer();						
			$http.post('model/videorating_model_new.php', {rated:true,limit:limitOf}).success(function(data) {															
				// console.log(data);
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,getUnRatedVideo: function(limitOf) {
			var deferred = $q.defer();						
			$http.post('model/videorating_model_new.php', {unrated:true,limit:limitOf}).success(function(data) {											
				// console.log(data);
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,getAllTags: function(type) {
			var deferred = $q.defer();
			if(type==1)  {
				$http.post('model/tags_model.php', {getTagsPrimaryAll:true}).success(function(data) {											
					// console.log('Get All Primary Tags');
					// console.log(data);
					deferred.resolve(data);
				});
			}
			else if(type==2)  {
				$http.post('model/tags_model.php', {getTagsAll:true}).success(function(data) {											
					// console.log('Get All Secondary Tags');
					// console.log(data);
					deferred.resolve(data);
				});
			}
			else if(type==3)  {
				console.log(type);
				$http.post('model/tags_model.php', {getSecondaryTagsAll:true}).success(function(data) {											
					console.log('Get All getSecondaryTagsAll Tags');
					console.log(data);
					deferred.resolve(data);
				});
			}
			else if(type==4)  {
				console.log(type);
				$http.post('model/tags_model.php', {getTertiaryTagsAll:true}).success(function(data) {											
					console.log('Get All getSecondaryTagsAll Tags');
					console.log(data);
					deferred.resolve(data);
				});
			}
			else {
				$http.post('model/tags_model.php', {getTagsAlls:true}).success(function(data) {											
					// console.log('Get All Secondary Tags');
					// console.log(data);
					deferred.resolve(data);
				});
			}
			return deferred.promise;
		}
		,getVideoTags: function(videoId,type) {
			var deferred = $q.defer();
			if(type) {
				$http.post('model/videotags_model.php', {getVideoTags:true,type:type,vid:videoId}).success(function(data) {
					deferred.resolve(data);
				});
			}
			else {
				$http.post('model/videotags_model.php', {getVideoTags:true,vid:videoId}).success(function(data) {
					deferred.resolve(data);
				});
			}
			return deferred.promise;
		}
		,getVideoTagsFeed: function(videoId,user) {
			var deferred = $q.defer();			
			$http.post('model/videotags_model.php', {getVideoTagsFeed:true,vid:videoId,user:user}).success(function(data) {
				deferred.resolve(data);
			});			
			return deferred.promise;
		}
		,getVideoTagCount: function(videoId) {
			var deferred = $q.defer();						
			$http.post('model/count_model.php', {getVideoTagCount:true,vid:videoId}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,getRankedVideoByUser: function() {
			var deferred = $q.defer();						
			$http.post('model/uservideo_model.php', {getRanked:true}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,getRankedVideoByAll: function() {
			var deferred = $q.defer();						
			$http.post('model/uservideo_model.php', {getRankedAll:true}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,addSystemTag: function(newTag) {
			var deferred = $q.defer();						
			$http.post('model/tags_model.php', {tagArr:newTag}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,editSystemTag: function(editTag) {
			var deferred = $q.defer();						
			$http.post('model/tags_model.php', {editTagArr:editTag}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,deactivateSystemTag: function(tagId) {
			var deferred = $q.defer();						
			$http.post('model/tags_model.php', {tagIdToDeactivate:tagId}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,activateSystemTag: function(tagId) {
			var deferred = $q.defer();						
			$http.post('model/tags_model.php', {tagIdToActivate:tagId}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,getAllAuthUser: function() {
			var deferred = $q.defer();						
			$http.post('model/adminuser_model.php', {getAllAuthUser :true}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,getAuthUserByEmail: function(email) {
			var deferred = $q.defer();						
			$http.post('model/adminuser_model.php', {getAuthUserByEmail :true, email:email}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,saveNewUser: function(newRow) {
			console.log(newRow);
			var deferred = $q.defer();						
			$http.post('model/adminuser_model.php', {save :true, newRow:newRow}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,saveEditUser: function(id,editRow) {
			console.log(editRow);
			var deferred = $q.defer();						
			$http.post('model/adminuser_model.php', {saveEdit :true, id:id,editRow:editRow}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,getUserChannel: function(id){
			console.log('getUserChannel');
			console.log(id);
			var deferred = $q.defer();						
			$http.post('model/channel_model.php', {getUserChannel :true, channelId:id}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,saveUserChannel: function(row){
			console.log('saveUserChannel');
			console.log(row);
			var deferred = $q.defer();						
			$http.post('model/channel_model.php', {saveUserChannel :true, channel:row}).success(function(data) {
				console.log('saveUserChannel');
				// console.log(data);
				deferred.resolve(data);
			});
			return deferred.promise;
		}
		,saveUserChannelVideo: function(row){
			console.log('saveUserChannelVideo');
			console.log(row);
			var deferred = $q.defer();						
			$http.post('model/channel_model.php', {saveUserChannelVideo :true, videos:row}).success(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}		
	}
});
videoTrackApp.directive('progressBar', function() {
	return function(scope, element, attrs) {
		scope.$watch(attrs.progressBar, function(val) {		
			element.html('<div class="bar" style="width: ' + val + '%"></div>');
		});
	}
});
videoTrackApp.directive('sidebarNav', function () {
    return {
      restrict: 'A',      
      link: function (scope, elem, attrs) {
      	console.log();
      	var active = attrs.active;
      	var col = attrs.col;
      	console.log(col);
      	var userchannel = "";
      	var dashboard = "";
      	var newsfeed = "";
      	var current = 'active';
      	if(active=="userchannel") userchannel = "active";
      	else if(active=="dashboard") dashboard = "active";
      	else if(active=="newsfeed") newsfeed = "active";
        // elem.html("<div>"+attrs.active+"</div>");
        elem.html('<div class="col-md-'+col+'"><div id="cssmenu"><ul><li class="'+userchannel+'"><a href="#!mychannel"><span>reignbert</span></a></li><li><a href="#"><span>Ranked Videos</span></a></li><li><a href="#"><span>My Tags</span></a></li><li class="last"><a href="#"><span>Contact</span></a></li></ul></div><hr/><div id="cssmenu"><ul><li><a href="#"><span>Trending</span></a></li><li class="'+newsfeed+'"><a href="#!dashboard"><span>News Feed</span></a></li><li class="last"><a href="#"><span>Followed</span></a></li></ul></div><br/></div>');        
      }
    }
});
videoTrackApp.directive("divtoDisqus", function () {
	return function (scope, element, attrs) {
		scope.$watch(attrs.divtoDisqus, function (val) {
			console.log(val);
			if (typeof loadDisqus == 'function') { 
				if(val) loadDisqus(val);
			}
		});
	};
});

videoTrackApp.directive('myDirective', function () {
	return {
		restrict: 'A',
		scope: {
			myDirective: '='
		},
		link: function (scope, element, attrs) {
			// set the initial value of the textbox
			element.val(scope.myDirective);
			element.data('old-value', scope.myDirective);

			// detect outside changes and update our input
			scope.$watch('myDirective', function (val) {
				element.val(scope.myDirective);
			});
			// on blur, update the value in scope
			element.bind('propertychange keyup paste', function (blurEvent) {
				if (element.data('old-value') != element.val()) {
					// console.log('value changed, new value is: ' + element.val());
					scope.$apply(function () {
						scope.myDirective = element.val();
						element.data('old-value', element.val());
					});
				}
			});
		}
	};
});
videoTrackApp.directive("timeago", function ($timeout) {
	return {
		restrict: 'A',
		scope: {
			title: '='
		},
		link: function (scope, element, attrs) {
			console.log('timeago');
			console.log(attrs.title);
			$timeout(function(){
				element.timeago();
			});
			scope.$watch('title', function() {
				element.timeago();
			},true);
		}
	};
});
videoTrackApp.directive('chosen', function () {
	var linker = function(scope,element,attrs){
		element.chosen({max_selected_options: 5 , no_results_text: "Oops, nothing found!"});
		scope.$watch('[tags, languageTags, language, rating]', function() {
			element.trigger('chosen:updated');
		},true);
	};
	return {
		restrict:'A',
		link: linker
	}
});
videoTrackApp.directive('notification', function($timeout){
  return {
     restrict: 'A',
	 template: '<span class="">Saved!</span>',
	 scope: {
		ngModel : '='
	 },
     link: function(scope, element, attrs){
		scope.$watch('checkClass', function() {
			// console.log("345"+scope.checkClass);
			if(scope.checkClass!=''&&scope.checkClass!=null) {
				$timeout(function(){
					 element.remove();
					 // console.log('hey');
				 }, 2000);
			 }
		},true);		         
     }
  }
});

videoTrackApp.directive("delayedSearch", ['$timeout', function($timeout) {
    return {
        restrict: "A",
        template: '<input type="text" required callback-search="searchDelay(arg);alert();" class="span4" ng-model="keyword" ng-change="resetPage()" callback-search="searchDelay(arg)" placeholder="Search Ranked"/>',
        scope: {
            ngModel : '='
			,callback : '&callbackSearch'
        },
        link: function (scope, element, attrs) {
            var timer = false;
            scope.$watch('keyword', function () {
                if (timer) {
                    $timeout.cancel(timer);
                }
                timer = $timeout(function () {
                    if (element.find('input').val()) {
						var keyword = element.find('input').val();
						// var keyword = element.find('input').val();
						scope.callback({arg:keyword});
						// scope.$apply();
                    }
                }, 1550)
            });
        }
    }
}]);

videoTrackApp.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});
videoTrackApp.filter('paginate', function() {
  return function(input, currentPage, numPerPage) {
		var begin = ((currentPage - 1) * numPerPage)
		, end = begin + numPerPage;
		if(input)
			return input.slice(begin, end);
  };
});
videoTrackApp.factory('languageService', function($http,$q) {
   var languageClass = [
   		{id:'1',name:'Afrikaans'}
   		,{id:'2',name:'Albanian'}
   		,{id:'3',name:'Arabic'}
   		,{id:'4',name:'Armenian'}
   		,{id:'5',name:'Azerbaijani'}
   		,{id:'6',name:'Basque'}
   		,{id:'7',name:'Belarusian'}
   		,{id:'8',name:'Bengali'}
   		,{id:'9',name:'Bosnian'}
   		,{id:'10',name:'Bulgarian'}
   		,{id:'11',name:'Catalan'}
   		,{id:'12',name:'Cebuano'}
   		,{id:'13',name:'Chinese'}
   		,{id:'14',name:'Croatian'}
   		,{id:'15',name:'Czech'}
   		,{id:'16',name:'Danish'}
   		,{id:'17',name:'Dutch'}
   		,{id:'18',name:'English'}
   		,{id:'19',name:'Esperanto'}
   		,{id:'20',name:'Estonian'}
   		,{id:'21',name:'Filipino'}
   		,{id:'22',name:'Finnish'}
   		,{id:'23',name:'French'}
   		,{id:'24',name:'Galician'}
   		,{id:'25',name:'Georgian'}
   		,{id:'26',name:'German'}
   		,{id:'27',name:'Greek'}
   		,{id:'28',name:'Gujarati'}
   		,{id:'29',name:'Haitian Creole'}
   		,{id:'30',name:'Hebrew'}
   		,{id:'31',name:'Hindi'}
   		,{id:'32',name:'Hmong'}
   		,{id:'33',name:'Hungarian'}
   		,{id:'34',name:'Icelandic'}
   		,{id:'35',name:'Indonesian'}
   		,{id:'36',name:'Irish'}
   		,{id:'37',name:'Italian'}
   		,{id:'38',name:'Japanese'}
   		,{id:'39',name:'Javanese'}
   		,{id:'40',name:'Kannada'}
   		,{id:'41',name:'Khmer'}
   		,{id:'42',name:'Korean'}
   		,{id:'43',name:'Lao'}
   		,{id:'44',name:'Latin'}
   		,{id:'45',name:'Latvian'}
   		,{id:'46',name:'Lithuanian'}
   		,{id:'47',name:'Macedonian'}
   		,{id:'48',name:'Malay'}
   		,{id:'49',name:'Maltese'}
   		,{id:'50',name:'Marathi'}
   		,{id:'51',name:'Norwegian'}
   		,{id:'52',name:'Persian'}
   		,{id:'53',name:'Polish'}
   		,{id:'54',name:'Portuguese'}
   		,{id:'55',name:'Romanian'}
   		,{id:'56',name:'Russian'}
   		,{id:'57',name:'Serbian'}
   		,{id:'58',name:'Slovak'}
   		,{id:'59',name:'Slovenian'}
   		,{id:'60',name:'Spanish'}
   		,{id:'61',name:'Swahili'}
   		,{id:'62',name:'Swedish'}
   		,{id:'63',name:'Tamil'}
   		,{id:'64',name:'Telugu'}
   		,{id:'65',name:'Thai'}
   		,{id:'66',name:'Turkish'}
   		,{id:'67',name:'Ukrainian'}
   		,{id:'68',name:'Urdu'}
   		,{id:'69',name:'Vietnamese'}
   		,{id:'70',name:'Welsh'}
   		,{id:'71',name:'Yiddish'}   		
   ];
   return {
        getLanguages: languageClass
    };
});
// videoTrackApp.run(function($rootScope, $location) {
//     $rootScope.location = $location;
// });
// top 40 - megamall