var near = require('./near-bus');
var mongoose = require('mongoose');
var model = require('./model');
var Bus = model.Bus;
var Relation = model.Relation;
//for search ways
var request = require('request');

//params request client
var start_lat = 53.6853361;
var start_lon = 23.824849999999998;

var end_lat = 53.71016;
var end_lon = 23.85209;


Bus.find({}, function (err, doc) {
  var distanceStart = [];
  var distanceEnd = [];

   doc.forEach(function(elem) {
    var dis = near.getDistance(elem.lat, elem.lon, start_lat, start_lon);
    var point = {id: elem.id, distance: dis};
    distanceStart.push(point);

   });

   doc.forEach(function(elem) {

    var dis = near.getDistance(elem.lat, elem.lon, end_lat, end_lon);
    var point = {id: elem.id, distance: dis};

    distanceEnd.push(point);


   });
 		var nearBusStart = arrayMin(distanceStart);
 		var nearBusEnd = arrayMin(distanceEnd);
 comparePoints(nearBusStart,nearBusEnd,distanceEnd);

});

var flag = true;

function checkDis(nearBusStart,nearBusEnd, distanceEnd) {
  for (var i = 0; i < distanceEnd.length; i++) {
    if(nearBusEnd==distanceEnd[i].id){
      distanceEnd.splice(i,1);
      nearBusEnd = arrayMin(distanceEnd);
      if(flag==false)break;
      comparePoints(nearBusStart,nearBusEnd,distanceEnd);
    }
  }
}



function comparePoints(nearBusStart,nearBusEnd,distanceEnd) {
  Relation.find({route: nearBusStart}, function (err, doc) {
    doc.forEach(function(index) {
      var routes = index.route;

      for (var i = 0; i < routes.length; i++) {
        if(routes[i]!=nearBusEnd){
          checkDis(nearBusStart,nearBusEnd, distanceEnd);
        }else if (routes[i]==nearBusEnd) {
          flag=false;
          findRoute(index.id, nearBusStart, nearBusEnd);
        }
      }

    });


  });
}

function findRoute(id_relation,start_id, end_id) {

 request('http://overpass-api.de/api/interpreter?data=[out:json];(relation('+id_relation+')(53.68532195613839,23.8114070892334,53.71636801215453,23.87578010559082););out body;>;out skel qt;', function (err, res, page) {
	if(err){
	 console.error(err);
	}else {
	 var distanceWayStart = [];
	 var distanceWayEnd = [];

	 var relation = JSON.parse(page);
	 var ways = relation.elements;


		 Bus.find({}, function (err, doc) {
			ways.forEach(function(index) {
			 if(index.type == "node") {
				doc.forEach(function (elem) {
				 if (elem.id == start_id) {
					var dis = near.getDistance(elem.lat, elem.lon, index.lat, index.lon);
					var point = {id: index.id, distance: dis};
					if (dis != 0) {
					 distanceWayStart.push(point);
					}
				 }
				});
				doc.forEach(function (elem) {
				 if (elem.id == end_id) {
					var dis = near.getDistance(elem.lat, elem.lon, index.lat, index.lon);
					var point = {id: index.id, distance: dis};
					if (dis != 0) {
					 distanceWayEnd.push(point);
					}
				 }
				});
			 }
		 });

			var nearPointStart = arrayMin(distanceWayStart);
			var nearPointEnd = arrayMin(distanceWayEnd);

			var start_point_id;
			var end_potin_id;

			ways.forEach(function (elem) {
			 if(elem.type == "way") {
				var nodes = elem.nodes;
				nodes.forEach(function (index) {
				 if (index == nearPointStart) {
					start_point_id = elem.id;
				 } else if (index == nearPointEnd) {
					end_potin_id = elem.id;
				 }
				});
			 }
			});

			var newMembers = [];
			var answerArray = [];

			ways.forEach(function (elem) {
			 if(elem.type=="relation"){
				var members = elem.members;

				for (var i=0; i< members.length; i++){
				 newMembers.push(members[i].ref);
				}

				for (var i=0; i< newMembers.length; i++){
				 var indexStart;
				 var indexEnd;
				 if(start_point_id==members[i].ref){
					indexStart=i;
				 }
				 if(end_potin_id==members[i].ref){
					indexEnd=i;
				 }
				}
				answerArray = newMembers.splice(indexStart,(indexEnd-indexStart+1));

			 }
			});

			var pointsToOut = [];

			ways.forEach(function (elem) {
			 answerArray.forEach(function (index) {
				if(elem.id==index) {
				 var nodes = elem.nodes;
				 nodes.forEach(function (ref) {
					pointsToOut.push(ref);
				 });
				}
			 });
			});


			var coordinate = [];
			ways.forEach(function (elem) {
			 	pointsToOut.forEach(function (index) {
				 if(elem.type=="node" && elem.id==index){
					var point = {lat: elem.lat, lon: elem.lon};
					coordinate.push(point);
				 }
				});
			});

			console.log("/////////////////////////");
			console.log(coordinate);



	 });
	}
 });




 //===========================================================================
  Relation.findOne({id:id_relation}, function (err, doc) {
    var routes = doc.route;
    for (var i = 0; i < routes.length; i++) {
      var indexStart;
      var indexEnd;
      if(start_id==routes[i]){
        indexStart=i;
      }
      if(end_id==routes[i]){
        indexEnd=i;
      }
    }
    var answer = routes.splice(indexStart,(indexEnd-indexStart+1));
    outRoute(answer);
  });
}


function outRoute(array) {
  var point = {lat: start_lat, lon: start_lon};
  var coordinate = [];
  coordinate.push(point);
  Bus.find({}, function (err, doc) {
    array.forEach(function(elem) {
      doc.forEach(function(index) {
        if(elem==index.id){
          point = {lat: index.lat, lon: index.lon};

          coordinate.push(point);
        }
      });

    });
    point = {lat: end_lat, lon: end_lon};
    coordinate.push(point);
	 	console.log(coordinate);
  });
}


function outPoints(array) {

}

function arrayMin(arr) {
  var length = arr.length;
  var min = Infinity;
  while (length--) {
    if (arr[length].distance < min) {
      min = arr[length].distance;
    }
  }
  arr.forEach(function(elem) {
    if(min==elem.distance){
      min = elem.id;
    }
  });
  return min;
}
