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

var alpha = Math.PI/3;
var beta = Math.PI/2;


var lineFunction = d3.line()
	.x(function(d) { return scale_x(d.x*Math.sin(beta) + d.z*Math.sin(alpha)); })
	.y(function(d) { return scale_y(d.y + d.x*Math.cos(beta) + d.z*Math.cos(alpha)); })

/* ---------- axis ---------- */
// x_axis
var drawer = canvas.append('g')
	.attr('transform', 'translate(10, 10)');

var all_ramos = {
	s1: [new Ramo('Matemáticas I', 'MAT021', 5, 'PC'),
		new Ramo('Programación', 'IWI131', 3, 'FI'),
		new Ramo('Introducción a la Física', 'FIS100', 3, 'PC'),
		new Ramo('Humanístico I', 'HRW132', 2, 'HUM'),
		new Ramo('Educación Física I', 'DEW100', 1, 'HUM')
	],
	s2: [new Ramo('Química y Sociedad', 'QUI010', 3, 'PC'),
		new Ramo('Matemáticas II', 'MAT022', 5, 'PC'),
		new Ramo('Física General I', 'FIS110', 3, 'PC'),
		new Ramo('Introducción a la Ingeniería', 'IWG101', 2, 'TIN'),
		new Ramo('Humanístico II', 'HRW133', 1, 'HUM'),
		new Ramo('Educación Física II', 'DEW101', 1, 'HUM')
	],
};

var globalY = 0;
var globalX = 0;
for (var semester in all_ramos) {
	console.log(semester);
	globalY = 0;
	all_ramos[semester].forEach(function(ramo) {
		ramo.draw(drawer, globalX, globalY, 100);
		globalY += 120;
	});
	globalX += 120;
};

drawer.selectAll(".ramo-label")
	.call(wrap, 90);

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
  });
}

