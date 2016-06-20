var near = require('./near-bus');
var mongoose = require('mongoose');
var model = require('./model');
var user = require('./currentUser');
var Bus = model.Bus;
var Relation = model.Relation;

Bus.find({}, function (err, doc) {
  var distanceStart = [];
  var distanceEnd = [];

   doc.forEach(function(elem) {

    var dis = near.getDistanceStart(elem.lat, elem.lon);
    var point = {id: elem.id, distance: dis};

    distanceStart.push(point);


   });

   doc.forEach(function(elem) {

    var dis = near.getDistanceEnd(elem.lat, elem.lon);
    var point = {id: elem.id, distance: dis};

    distanceEnd.push(point);


   });

   var nearBusStart = arrayMin(distanceStart);
   var nearBusEnd = arrayMin(distanceEnd);



   //checkDis(nearBusEnd, distanceEnd);

   var an = comparePoints(nearBusStart,nearBusEnd,distanceEnd);


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

var compare = [];

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
  var point = {lat: user.start_lat, lon: user.start_lon};
  var coordinate = [];
  coordinate.push(point);
  Bus.find({}, function (err, doc) {
    array.forEach(function(elem) {
      doc.forEach(function(index) {
        if(elem==index.id){
          point = {lat: index.lat, lon: index.lon};

          coordinate.push(point);
          console.log(index.name);
        }
      });

    });
    point = {lat: user.end_lat, lon: user.end_lon};
    coordinate.push(point);
    console.log(coordinate);
  });
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
};
