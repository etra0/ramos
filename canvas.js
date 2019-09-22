// Cambie las variables scale para aumentar o reducir las dimensiones de la malla
// Se recomienda fuertemente valores NO MENORES a 0.5 ademas de no modificar mucho scaleY
var scaleX, scaleY, canvas, tipoRamo;

// variables de mensaje
var welcomeTitle, welcomeDesc;

// verificamos que malla busca
var current_malla = 'INF';
if (window.location.search) {
	var params = new URLSearchParams(window.location.search);
	if (params.has('m'))
		current_malla = params.get('m');
	
}
if (d3.select(".canvas")._groups[0][0]) {
	
	scaleX = 1;
	scaleY = 1;
	canvas = d3.select(".canvas");
	tipoRamo = Ramo;
	welcomeTitle = `¡Bienvenido a la Malla Interactiva de `
	welcomeDesc = `Puedes tachar tus ramos aprobados haciendo click sobre ellos.
	A medida que vas aprobando ramos, se van liberando los que tienen prerrequisitos.
	Haz click en cualquier lado para comenzar.`

}	else if (d3.select(".priori-canvas")._groups[0][0]) {
	
	scaleX = 0.67;
	scaleY = 1;
	canvas = d3.select(".priori-canvas");
	tipoRamo = SelectableRamo;
	welcomeTitle = `¡Bienvenido a la calculadora de prioridad `
	welcomeDesc = `¡Selecciona los ramos por semestre e ingresa tus notas para
	 calcular tu prioridad! A medida que avances de semestre, los ramos aprobados se
	 tacharán automaticamente. Si has cursado un ramo que no esta en la malla,
	 crealo en la tabla de abajo.`;

} else if (d3.select(".custom-canvas")._groups[0][0]) {
	scaleX = 0.67;
	scaleY = 1;
	canvas = d3.select(".custom-canvas");
	tipoRamo = SelectableRamo;
	welcomeTitle = `¡Bienvenido a la generadora de mallas!`
	welcomeDesc = `¡Selecciona los ramos por semestre y genera una malla a tu gusto!
	Si quieres un ramo que no esta en la malla,crealo en la tabla de abajo.`;
}

var height = 730 * scaleX,
	width =1570 * scaleY;

canvas = canvas.append("svg")
		.attr('width', width)
		.attr('height', height);

var carreras = {
	'ARQ': 'Arquitectura',
	'INF': 'Informática',
    'ICI': 'Industrial',
	'ELO': 'Electrónica',
	'TEL': 'Telemática',
	'ICOM': 'Comercial',
	'CIV': 'Civil',
	'MAT': 'Matemática',
	'FIS': 'Licenciatura en Física',
	'MEC': 'Mecánica',
	'ICQ': 'Química',
	'ELI': 'Eléctrica',
    'CONSTRU': 'Construcción',
	'IDP': 'Diseño de Productos',
    'MET': 'Metalúrgica',
    'ICA': 'Ambiental'
}

/* ---------- axis ---------- */
var drawer = canvas.append('g')
	.attr('transform', 'translate(10, 20)');

var globalY = 0;
var globalX = 0;
var _semester = 1;
var _s = ["I", "II", "III", "IV", "V", 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV']

var malla = {};
var all_ramos = {};
var total_creditos = 0;
var total_ramos = 0;
let id = 1;

$("#carrera").text(carreras[current_malla]);

/* PC: Plan común
 * FI: Fundamentos de Informática
 * HUM: Humanistas, libres y deportes
 * TIN: Transversal e Integración
 * SD: Sistemas de decisión informática
 * IND: Industrias
 * AN: Análisis Numérico
 */
d3.queue()
	.defer(d3.json, "/data/data_" + current_malla + ".json")
	.defer(d3.json, "/data/colors_" + current_malla + ".json")
  .await(main_function);

function main_function(error, data, colorBySector) {
	if (error) {
		console.log(error);
		$(".canvas").prepend("<h1>OPS!, malla no encontrada, <a href='http://labcomp.cl/~saedo/apps/viz/ramos'>Volver al inicio</a></h1>");
		return;
	}
	// load the data
	let longest_semester = 0;
	for (var semester in data) {
		malla[semester] = {};

		if (data[semester].length > longest_semester)
			longest_semester = data[semester].length;

		data[semester].forEach(function(ramo) {
			malla[semester][ramo[1]] = new tipoRamo(ramo[0], ramo[1], ramo[2], ramo[3], (function() {
				if (ramo.length > 4)
					return ramo[4];
				return [];
			})(), id++, colorBySector)
			all_ramos[ramo[1]] = malla[semester][ramo[1]];
            total_creditos += ramo[2];
            total_ramos++;
		});
	}

	// update width y height debido a que varian segun la malla
		// + 10 para evitar ocultamiento de parte de la malla
	width = (130*Object.keys(malla).length) * scaleX + 10;
	height = (110*longest_semester + 30 + 25) * scaleY + 10;

	canvas.attr("width", width)
		.attr("height", height);
	drawer.attr("width", width)
		.attr("height", height);

	// colores de la malla
	Object.keys(colorBySector).forEach(key => {
		color_description = d3.select(".color-description").append("div")
			.attr("style", "display:flex;vertical-align:middle;margin-right:15px;");
		circle_color = color_description.append("svg")
			.attr("height", "25px")
			.attr("width", "25px");
		circle_color.append("circle")
			.attr("r", 10)
			.attr("cx", 12)
			.attr("cy", 12)
			.attr("fill", colorBySector[key][0]);

		color_description.append("span").text(colorBySector[key][1]);

	});

	for (var semester in malla) {
		globalY = 0;
		// draw the axis
		drawer.append("rect")
			.attr("x", globalX)
			.attr("y", globalY)
			.attr("width", 120 * scaleX)
			.attr("height", 30 * scaleY)
			.attr("fill", 'gray');

		drawer.append("text")
			.attr('x', globalX + 110/2 * scaleX)
			.attr('y', globalY + 2*30/3 * scaleY)
			.text(_s[_semester-1])
			.attr('text-anchor', 'middle')
			.attr("font-family", "sans-serif")
			.attr("font-weight", "bold")
			.attr("fill", "white");
		_semester++;
		globalY += 40 * scaleY;

		for (var ramo in malla[semester]) {
			malla[semester][ramo].draw(drawer, globalX, globalY, scaleX, scaleY);
			globalY += 110 * scaleY;
		};
		globalX += 130 * scaleX;
	};
	drawer.selectAll(".ramo-label")
		.call(wrap, 115 * scaleX, (100 - 100/5*2) * scaleY);

	// verificar cache
	if (d3.select(".priori-canvas")._groups[0][0] == null && d3.select(".custom-canvas")._groups[0][0] == null) {
		var cache_variable = 'approvedRamos_' + current_malla;
		if (cache_variable in localStorage && localStorage[cache_variable] !== "") {
			let approvedRamos = localStorage[cache_variable].split(",");
			approvedRamos.forEach(function(ramo) {
				all_ramos[ramo].approveRamo();
			});
		}
	}

	// verificar prerrequisitos
	d3.interval(function() {
		for (var semester in malla) {
			for (var ramo in malla[semester]) {
				malla[semester][ramo].verifyPrer();
			}
		}

		let current_credits = 0;
        let current_ramos = APPROVED.length;
		APPROVED.forEach(function(ramo) {
			current_credits += ramo.creditos;
		});
		d3.select(".info").select("#creditos").text(`${current_credits} (${parseInt((current_credits/total_creditos)*100)}%), Total ramos: ${parseInt(current_ramos*100/total_ramos)}%`);
	}, 30);

	// filling the cache!
	d3.interval(function() {
		if (d3.select(".priori-canvas")._groups[0][0] == null && d3.select(".custom-canvas")._groups[0][0] == null) { 
		let willStore = []
		APPROVED.forEach(function(ramo) {
			willStore.push(ramo.sigla);
		});
		localStorage[cache_variable] = willStore;
		}
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
		.attr("y", height/2 - 180 * scaleY)
		.attr("dy", 0)
		.attr("text-anchor", "middle")
		.attr("font-size", 40* scaleX)
		.attr("opacity", 0.01)
		.text( function() {
			if (d3.select(".custom-canvas")._groups[0][0])
				return welcomeTitle
			return welcomeTitle + carreras[current_malla]
		})
		.transition().duration(800)
		.attr("y", height/2)
		.attr("opacity", 1)
		.call(wrap, 900 * scaleX, height);
	first_time.append("text")
		.attr("x", width/2)
		.attr("y", height/2 - 90 * scaleY)
		.attr("dy", "2.1em")
		.attr("text-anchor", "middle")
		.attr("font-size", 30*scaleX)
		.attr("opacity", 0.01)
		.text(welcomeDesc)
		.transition().duration(800)
		.attr("y", height/2)
		.attr("opacity", 1)
		.call(wrap, 900 * scaleX, height);

	first_time.on('click', function() {
		d3.select(this).transition().duration(200).style('opacity', 0.1).on('end', function() {
			d3.select(this).remove();
		});
	});

	if (d3.select(".priori-canvas")._groups[0][0]) { 
		start_priorix();
	} else if (d3.select(".custom-canvas")._groups[0][0]) {
		start_generator();
	}
}

// Encaja el texto en un rectangulo dado
// Si el texto no cabe, se achica la letra!
function wrap(text, width, height) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				fontsize = parseInt(text.attr("font-size"),10),
				tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", dy + "em"),
				textLines,
				textHeight;
    while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				while (tspan.node().getComputedTextLength() > width) {
					if (line.length == 1) {
						text.attr("font-size", String(--fontsize));
					}
					else {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text.append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
					}
				}
		}
		textLines =  text.selectAll('tspan')._groups[0].length;
	  if (textLines === 1) {
		  text.selectAll('tspan').attr('y', (+d3.select(this).attr('y')) + (+5));
	  } else if (textLines > 2) {
		  text.selectAll('tspan').attr('y', d3.select(this).attr('y') - (110/2) * scaleY/4 );
		}
		textHeight = text.node().getBoundingClientRect().height;

		while (textHeight > height - 5) {
			text.attr("font-size", String(--fontsize));
			textHeight = text.node().getBoundingClientRect().height;
			lineNumber = 0;
			let tspans = text.selectAll('tspan')
			for (let index = 0; index < textLines; index++) {
				let tspan = tspans._groups[0][index];
				tspan.setAttribute('dy', lineNumber++ * 1 + dy + 'em'); 
				
			}
		}
  });
}

function limpiarRamos() {
	for (let i = APPROVED.length - 1; i >= 0; i--) {
		APPROVED[i].approveRamo();
	}
}

