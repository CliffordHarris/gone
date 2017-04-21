var hr = angular.module('hr', []);

hr.controller('homeRunController', ['$scope', '$http', hitAHomer]);

function hitAHomer($scope, $http) {
	$scope.getDataToPost = getDataToPost;
	$scope.postToSlack = postToSlack;

	var link = 'getThisLinkFromSlack';

	function makeLink() {
		$scope.month = new Date().getMonth() + 1;
		$scope.day = new Date().getDate();
		$scope.year = new Date().getFullYear();

		var today = {
			"month": $scope.month < 10 ? $scope.month = '0' + $scope.month : $scope.month,
			"day": $scope.day < 10 ? $scope.day = '0' + $scope.day : $scope.day,
			"year": $scope.year
		}

		var apiUrl = 'http://gd2.mlb.com/components/game/mlb/year_' + today.year + '/month_' + today.month + '/day_' + today.day + '/master_scoreboard.json';
		// var apiUrl = "http://gd2.mlb.com/components/game/mlb/year_2017/month_04/day_16/master_scoreboard.json";

		return apiUrl;
	}

	function getDataToPost() {
		var thisURL = makeLink();
		console.log(thisURL);
		var hrObj = {};
		var hrArr = [];

		$http.get(thisURL)
			.then(function (data) {
				$scope.receivedJSON = data.data.data.games.game;
				var hr = _.pluck($scope.receivedJSON, 'home_runs');
				//var score = _.pluck($scope.receivedJSON, 'alerts');
				var mkeObj = _.filter($scope.receivedJSON, function (team) {
					return team.away_team_name == "Brewers" || team.home_team_name == "Brewers";
				});
				var hrObj = {};
				var hrArr = [];
				$scope.testData = _.filter(hr, function (x) {
					if (x != undefined) {

						if (_.isArray(x.player)) {
							_.each(x.player, function (list) {
								if (list.team_code == "mil") {
									hrArr.push(list);
								}
							})
						} else if (_.isObject(x.player)) {
							if (x.player.team_code == "mil") {
								hrArr.push(x.player);
							}
						}
					}
				});
				var sortedArr = _.sortBy(hrArr, 'inning');
				//$scope.hrType = "solo";
				$scope.testData = sortedArr.reverse()[0];

				if ($scope.testData) {
					switch (parseInt($scope.testData.runners)) {
						case 0:
							$scope.hrType = "solo home run";
							break;
						case 1:
							$scope.hrType = "2 run homer";
							break;
						case 2:
							$scope.hrType = "3 run homer";
							break;
						case 3:
							$scope.hrType = "f*#!ing grand slam";
							break;
						default:
							$scope.hrType = "home run";
							break;
					}
				}

				var message =
					{
						"attachments": [
							{
								"fallback": "Home Run!"
							}
						]
					}
				var text = `${mkeObj[0].away_team_name} ${mkeObj[0].linescore.r.away}, ${mkeObj[0].home_team_name} ${mkeObj[0].linescore.r.home} `;
				var title = `${$scope.testData.first} ${$scope.testData.last} hits a ${$scope.hrType} in the ${addSuffix($scope.testData.inning)}! (No. ${$scope.testData.std_hr})`;
				var goToLink = "https://www.mlb.com/brewers/scores";

				var color = mkeObj[0].home_code == 'mil' ? "#2570a9" : "#FFD700"; //..need to switch color based on location... !

				message.attachments[0]["color"] = color;
				message.attachments[0]["text"] = text;
				message.attachments[0]["title"] = title;
				message.attachments[0]["title_link"] = goToLink;
				message.attachments[0]["fields"] = [
					{
						"title": "Home Runs This Year",
						"value": $scope.testData.std_hr,
						"short": true
					}
				];

				postToSlack(message);
			})

	}

	function postToSlack(msg) {
		$.ajax({
			type: "POST",
			url: link,
			data: JSON.stringify(msg),
		});
	}


	function addSuffix(i) {
		var j = i % 10,
			k = i % 100;
		if (j == 1 && k != 11) {
			return i + "st";
		}
		if (j == 2 && k != 12) {
			return i + "nd";
		}
		if (j == 3 && k != 13) {
			return i + "rd";
		}
		return i + "th";
	}








}



	// 			$scope.message = 
	// {
 //    "attachments": [
 //        {
 //            "fallback": "A Brewer hit a home run!",
 //            "color": "#2570a9",
 //            "title": "Someone did something awesome!",
 //            "title_link": "https://api.slack.com/",
 //            "text": "Optional text that appears within the attachment",
 //            // "pretext": "Person",
 //            // "author_name": "Bobby Tables",
 //            // "author_link": "http://flickr.com/bobby/",
 //            // "author_icon": "http://flickr.com/icons/bobby.jpg",
 //            // "fields": [
 //            //     {
 //            //         "title": "Priority",
 //            //         "value": "High",
 //            //         "short": false
 //            //     }
 //            // ],
 //            // "image_url": "http://my-website.com/path/to/image.jpg",
 //            // "thumb_url": "http://example.com/path/to/thumb.png",
 //            // "footer": "Slack API",
 //            // "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
 //            // "ts": 123456789
 //        }
 //    ]
	// }

	// 		// var text = `Brewers - ${$scope.day}, Cubs - 11`;
	// 		// var title = `${$scope.testData.first} hit a ${hrType} Home Run!`;
	// 		// var goToLink = 'brewers.com';

	//   //       $scope.message.attachments[0]["color"] = "#2570a9";
	// 		// $scope.message.attachments[0]["text"] =  text;
	// 		// $scope.message.attachments[0]["title"] = title;
	// 		// $scope.message.attachments[0]["title_link"] =  goToLink;

	//   //           // "color": "#2570a9",
	//             // "title": "Someone did something awesome!",
	//             // "title_link": "brewers.com",
	//             // "text": "Optional text that appears within the attachment"


	// 		// $scope.testData = 
	// 		// "http://gd2.mlb.com/components/game/mlb/year_2017/month_04/day_09/master_scoreboard.json.data";
	// 		var x;
	// 	});
	// }




	// function postToSlack(){
	// 	getDataToPost();
	// 	$http.post(link, $scope.message).then(

	// 		function(response){
	// 			console.log("SUCCESS!");
	// 			console.log(response.status);
	// 	}).catch(
	// 		function(e){
	// 			console.log("FAIL");
	// 			console.log(e);
	// 	});
	// }
