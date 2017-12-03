var width = 1330,
	height = 730;

var canvas = d3.select(".canvas")
	.append("svg")
	.attr('width', width)
	.attr('height', height);

/* ---------- axis ---------- */
var drawer = canvas.append('g')
	.attr('transform', 'translate(10, 20)');

var globalY = 0;
var globalX = 0;
var _semester = 1;
var _s = ["I", "II", "III", "IV", "V", 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV']

var malla = {};
var all_ramos = {};
let id = 1;

/* PC: Plan común
 * FI: Fundamentos de Informática
 * HUM: Humanistas, libres y deportes
 * TIN: Transversal e Integración
 * SD: Sistemas de decisión informática
 * IND: Industrias
 * AN: Análisis Numérico
 */
d3.queue()
	.defer(d3.json, "./data.json")
	.defer(d3.json, "./colors.json")
  .await(main_function);

function main_function(error, data, colorBySector) {
	console.log(colorBySector)
	// load the data
	for (var semester in data) {
		malla[semester] = {};
		data[semester].forEach(function(ramo) {
			malla[semester][ramo[1]] = new Ramo(ramo[0], ramo[1], ramo[2], ramo[3], (function() {
				if (ramo.length > 4)
					return ramo[4];
				return [];
			})(), id++, colorBySector)
			all_ramos[ramo[1]] = malla[semester][ramo[1]];
		});
	}

	for (var semester in malla) {
		globalY = 0;
		// draw the axis
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

		for (var ramo in malla[semester]) {
			malla[semester][ramo].draw(drawer, globalX, globalY, 100);
			globalY += 110;
		};
		globalX += 120;
	};
	drawer.selectAll(".ramo-label")
		.call(wrap, 100);

	// verificar cache
	if ('approvedRamos' in localStorage && localStorage['approvedRamos'] !== "") {
		let approvedRamos = localStorage['approvedRamos'].split(",");
		approvedRamos.forEach(function(ramo) {
			all_ramos[ramo].approveRamo();
		});
	}

	// verificar prerrequisitos
	d3.interval(function() {
		for (var semester in malla) {
			for (var ramo in malla[semester]) {
				malla[semester][ramo].verifyPrer();
			}
		}

		let c = 0;
		APPROVED.forEach(function(ramo) {
			c += ramo.creditos;
		});
		d3.select(".info").select("#creditos").text(c);
	}, 30);

	// filling the cache!
	d3.interval(function() {
		let willStore = []
		APPROVED.forEach(function(ramo) {
			willStore.push(ramo.sigla);
		});
		localStorage['approvedRamos'] = willStore;
	}, 2000);

	var first_time = canvas.append("g")
	first_time.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("fill", "white")
		.attr("opacity", 0.9);
	first_time.append("text")
		.attr("x", width/2)
		.attr("y", height/2 - 90)
		.attr("dy", 0)
		.attr("text-anchor", "middle")
		.attr("font-size", 40)
		.attr("opacity", 0.01)
		.text("¡Bienvenido a la Malla Interactiva de Info!")
		.transition().duration(800)
		.attr("y", height/2)
		.attr("opacity", 1)
		.call(wrap, 900);
	first_time.append("text")
		.attr("x", width/2)
		.attr("y", height/2 - 90)
		.attr("dy", "2.1em")
		.attr("text-anchor", "middle")
		.attr("font-size", 30)
		.attr("opacity", 0.01)
		.text(`Puedes tachar tus ramos aprobados haciendo click sobre ellos.
	A medida que vas aprobando ramos, se van liberando los que tienen prerrequisitos.
	Haz click en cualquier lado para comenzar.`)
		.transition().duration(800)
		.attr("y", height/2)
		.attr("opacity", 1)
		.call(wrap, 900);

	first_time.on('click', function() {
		d3.select(this).transition().duration(200).style('opacity', 0.1).on('end', function() {
			d3.select(this).remove();
		});
	});
}


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

function limpiarRamos() {
	for (let i = APPROVED.length - 1; i >= 0; i--) {
		APPROVED[i].approveRamo();
	}
}

