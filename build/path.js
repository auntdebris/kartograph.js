(function() {

  /*
      svgmap - a simple toolset that helps creating interactive thematic maps
      Copyright (C) 2011  Gregor Aisch
  
      This program is free software: you can redistribute it and/or modify
      it under the terms of the GNU General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.
  
      This program is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU General Public License for more details.
  
      You should have received a copy of the GNU General Public License
      along with this program.  If not, see <http://www.gnu.org/licenses/>.
  */

  var Line, Path, root, svgmap, _ref, _ref2;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  svgmap = (_ref = root.svgmap) != null ? _ref : root.svgmap = {};

  if ((_ref2 = svgmap.geom) == null) svgmap.geom = {};

  Path = (function() {

    /*
    	represents complex polygons (aka multi-polygons)
    */

    function Path(contours, closed) {
      this.contours = contours;
      this.closed = closed != null ? closed : true;
    }

    Path.prototype.clipToBBox = function(bbox) {
      throw "path clipping is not implemented yet";
    };

    Path.prototype.toSVG = function() {
      /*
      		translates this path to a SVG path string
      */
      var contour, fst, glue, me, str, x, y, _i, _j, _len, _len2, _ref3, _ref4;
      me = this;
      str = "";
      glue = me.closed ? "Z M" : "M";
      _ref3 = me.contours;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        contour = _ref3[_i];
        fst = true;
        str += str === "" ? "M" : glue;
        for (_j = 0, _len2 = contour.length; _j < _len2; _j++) {
          _ref4 = contour[_j], x = _ref4[0], y = _ref4[1];
          if (!fst) str += "L";
          str += x + ',' + y;
          fst = false;
        }
      }
      if (me.closed) str += "Z";
      return str;
    };

    return Path;

  })();

  Path.fromSVG = function(path_str) {
    /*
    	loads a path from a SVG path string
    */
    var closed, contour, contour_str, contours, pt_str, sep, x, y, _i, _j, _len, _len2, _ref3, _ref4, _ref5;
    contours = [];
    path_str = path_str.trim();
    closed = path_str[path_str.length - 1] === "Z";
    sep = closed ? "Z M" : "M";
    path_str = path_str.substring(1, path_str.length - (closed ? 1 : 0));
    _ref3 = path_str.split(sep);
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      contour_str = _ref3[_i];
      contour = [];
      if (contour_str !== "") {
        _ref4 = contour_str.split('L');
        for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
          pt_str = _ref4[_j];
          _ref5 = pt_str.split(','), x = _ref5[0], y = _ref5[1];
          contour.push([Number(x), Number(y)]);
        }
        contours.push(contour);
      }
    }
    return new svgmap.geom.Path(contours, closed);
  };

  svgmap.geom.Path = Path;

  Line = (function() {

    /*
    	represents simple lines
    */

    function Line(points) {
      this.points = points;
    }

    Line.prototype.clipToBBox = function(bbox) {
      var clip, i, last_in, lines, p0x, p0y, p1x, p1y, pts, self, x0, x1, y0, y1, _ref3, _ref4, _ref5, _ref6;
      self = this;
      clip = new svgmap.geom.clipping.CohenSutherland().clip;
      pts = [];
      lines = [];
      last_in = false;
      for (i = 0, _ref3 = self.points.length - 2; 0 <= _ref3 ? i <= _ref3 : i >= _ref3; 0 <= _ref3 ? i++ : i--) {
        _ref4 = self.points[i], p0x = _ref4[0], p0y = _ref4[1];
        _ref5 = self.points[i + 1], p1x = _ref5[0], p1y = _ref5[1];
        try {
          _ref6 = clip(bbox, p0x, p0y, p1x, p1y), x0 = _ref6[0], y0 = _ref6[1], x1 = _ref6[2], y1 = _ref6[3];
          last_in = true;
          pts.push([x0, y0]);
          if (p1x !== x1 || p1y !== y0 || i === len(self.points) - 2) {
            pts.push([x1, y1]);
          }
        } catch (err) {
          if (last_in && pts.length > 1) {
            lines.push(new Line(pts));
            pts = [];
          }
          last_in = false;
        }
      }
      if (pts.length > 1) lines.push(new Line(pts));
      return lines;
    };

    Line.prototype.toSVG = function() {
      var pts, self, x, y, _i, _len, _ref3, _ref4;
      self = this;
      pts = [];
      _ref3 = self.points;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        _ref4 = _ref3[_i], x = _ref4[0], y = _ref4[1];
        pts.push(x + ',' + y);
      }
      return 'M' + pts.join('L');
    };

    return Line;

  })();

  svgmap.geom.Line = Line;

}).call(this);