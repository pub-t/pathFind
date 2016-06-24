var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(MapLat, MapLon, point_lat, point_lon) {

  var R = 6378137; //средний радиус Земли в метрах
  var dLat = rad(MapLat - point_lat);
  var dLong = rad(MapLon - point_lon);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(point_lat)) * Math.cos(rad(point_lon)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return Math.ceil(d); //возвращает дистанцию между двумя точками в МЕТРАХ
};

module.exports.getDistance = getDistance;
