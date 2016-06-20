var user = require('./currentUser');

var massForDistance =[];

var rad = function(x) {
  return x * Math.PI / 180;
};

var minElem = function(massForDistance) {
  min = massForDistance[0];
  for (var i = 0; i < massForDistance.length; i++) {
  }
  return min;
}

var getDistanceStart = function(MapLat, MapLon) {

  var R = 6378137; //средний радиус Земли в метрах
  var dLat = rad(MapLat - user.start_lat);
  var dLong = rad(MapLon - user.start_lon);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(user.start_lat)) * Math.cos(rad(user.start_lon)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return Math.ceil(d); //возвращает дистанцию между двумя точками в МЕТРАХ
};

var getDistanceEnd = function(MapLat, MapLon) {

  var R = 6378137; //средний радиус Земли в метрах
  var dLat = rad(MapLat - user.end_lat);
  var dLong = rad(MapLon - user.end_lon);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(user.end_lat)) * Math.cos(rad(user.end_lon)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return Math.ceil(d); //возвращает дистанцию между двумя точками в МЕТРАХ
};

var p = 53.7067213;
var s = 23.8504604;

//console.log(getDistanceEnd(p, s));

module.exports.getDistanceStart = getDistanceStart;
module.exports.getDistanceEnd = getDistanceEnd;
