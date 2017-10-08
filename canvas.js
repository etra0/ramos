var width = 1200,
	height = 600;

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
		new Ramo('Programación', 'IWI101', 3, 'FI')
	]
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

