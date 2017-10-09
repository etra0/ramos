var width = 1200,
	height = 800;

var canvas = d3.select(".canvas")
	.append("svg")
	.attr('width', width)
	.attr('height', height);

var range_show = 2;
var scale_x = d3.scaleLinear()
	.domain([-range_show, range_show])
	.range([0, height]);

var scale_y = d3.scaleLinear()
	.domain([range_show, -range_show])
	.range([0, width]);


/* ---------- axis ---------- */
// x_axis
var drawer = canvas.append('g')
	.attr('transform', 'translate(10, 20)');

var globalY = 0;
var globalX = 0;
var _semester = 1;
var _s = ["I", "II", "III", "IV", "V"]
for (var semester in all_ramos) {
	globalY = 0;
	drawer.append("rect")
		.attr("x", globalX)
		.attr("y", globalY)
		.attr("width", 110)
		.attr("height", 30)
		.attr("fill", 'gray');

	drawer.append("text")
		.attr('x', globalX + 110/2)
		.attr('y', globalY + 2*30/3)
		.text(_s[_semester-1])
		.attr('text-anchor', 'middle')
		.attr("font-family", "sans-serif")
		.attr("font-weight", "bold")
		.attr("fill", "white");
	_semester++;
	globalY += 40;

	all_ramos[semester].forEach(function(ramo) {
		ramo.draw(drawer, globalX, globalY, 100);
		globalY += 110;
	});
	globalX += 120;
};

drawer.selectAll(".ramo-label")
	.call(wrap, 100);

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
	  if (text.selectAll('tspan')._groups[0].length === 1) {
		  text.selectAll('tspan').attr('y', (+d3.select(this).attr('y')) + (+5));
	  } else if (text.selectAll('tspan')._groups[0].length > 2) {
		  text.selectAll('tspan').attr('y', d3.select(this).attr('y') - 10);
	  }
  });
}

