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
	s1: [new Ramo('Matemáticas I', 'MAT-021', 5, 'PC'),
		new Ramo('Programación', 'IWI-131', 3, 'FI'),
		new Ramo('Introducción a la Física', 'FIS-100', 3, 'PC'),
		new Ramo('Humanístico I', 'HRW-132', 2, 'HUM'),
		new Ramo('Educación Física I', 'DEW-100', 1, 'HUM')
	],
	s2: [new Ramo('Química y Sociedad', 'QUI-010', 3, 'PC'),
		new Ramo('Matemáticas II', 'MAT-022', 5, 'PC'),
		new Ramo('Física General I', 'FIS-110', 3, 'PC'),
		new Ramo('Introducción a la Ingeniería', 'IWG-101', 2, 'TIN'),
		new Ramo('Humanístico II', 'HRW-133', 1, 'HUM'),
		new Ramo('Educación Física II', 'DEW-101', 1, 'HUM')
	],
	s3: [new Ramo('Estructuras de Datos', 'INF-134', 3, 'FI'),
		new Ramo('Matemáticas III', 'MAT-023', 4, 'PC'),
		new Ramo('Física General III', 'FIS-130', 4, 'PC'),
		new Ramo('Estructuras Discretas', 'INF-152', 3, 'FI'),
		new Ramo('Teoría de Sistemas', 'INF-260', 3, 'SD'),
		new Ramo('Libre I', 'INF-1', 1, 'HUM')
	],
	s4: [
		new Ramo('Lenguajes de Programación', 'INF-253', 3, 'FI'),
		new Ramo('Matemáticas IV', 'MAT-024', 4, 'PC'),
		new Ramo('Física General II', 'FIS-120',  4, 'PC'),
		new Ramo('Informática Teórica', 'INF-155', 3, 'FI'),
		new Ramo('Economía IA', 'IWN-170', 3, 'IND'),
		new Ramo('Libre II', 'INF-2', 1, 'HUM')
	],
	s5: [
		new Ramo('Bases de Datos', 'INF-239', 3, 'IS'),
		new Ramo('Arquitectura y Organización de Computadores', 'INF-245', 3, 'TIC')
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

