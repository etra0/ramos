// Cambie las variables scale para aumentar o reducir las dimensiones de la malla
// Se recomienda fuertemente valores NO MENORES a 0.5 ademas de no modificar mucho scaleY
let scaleX, scaleY, canvas, tipoRamo;

// variables de mensaje
let welcomeTitle, welcomeDesc;

let prioridad = false;
let personal = false;
// verificamos que malla busca
let current_malla = 'INF';
let sct = false
if (window.location.search) {
	const params = new URLSearchParams(window.location.search);
	if (params.has('m'))
		current_malla = params.get('m');
	if (params.has('SCT'))
		sct = ('true' == params.get('SCT'))
	
}
if (d3.select(".canvas")._groups[0][0]) {
	
	scaleX = 1;
	scaleY = 1;
	canvas = d3.select(".canvas");
	tipoRamo = Ramo;
	welcomeTitle = `¡Bienvenido a la Malla Interactiva de `;
	welcomeDesc = `Puedes tachar tus ramos aprobados haciendo click sobre ellos.
	A medida que vas aprobando ramos, se van liberando los que tienen prerrequisitos.
	Haz click en cualquier lado para comenzar.`

}	else if (d3.select(".priori-canvas")._groups[0][0]) {
	prioridad = true;
	scaleX = 0.67;
	scaleY = 1;
	canvas = d3.select(".priori-canvas");
	tipoRamo = SelectableRamo;
	welcomeTitle = `¡Bienvenido a la calculadora de prioridad `;
	welcomeDesc = `¡Selecciona los ramos por semestre e ingresa tus notas para
	 calcular tu prioridad! A medida que avances de semestre, los ramos aprobados se
	 tacharán automaticamente. Si has cursado un ramo que no esta en la malla,
	 crealo en la tabla de abajo.`;

} else if (d3.select(".custom-canvas")._groups[0][0]) {
	personal = true;
	scaleX = 0.67;
	scaleY = 1;
	canvas = d3.select(".custom-canvas");
	tipoRamo = CustomRamo;
	welcomeTitle = `¡Bienvenido a la generadora de mallas!`;
	welcomeDesc = `¡Selecciona los ramos por semestre y genera una malla a tu gusto!
	Si quieres un ramo que no esta en la malla, crealo en la tabla de abajo.`;
}
if (!(prioridad|personal)) {
	d3.select('#goToCalculator').attr('href', '/prioridad/?m=' + current_malla)
	d3.select('#goToGenerator').attr('href', '/personalizar/?m=' + current_malla)
} else if (prioridad) {
	d3.select('#goToHome').attr('href', '/?m=' + current_malla)
	d3.select('#goToGenerator').attr('href', '/personalizar/?m=' + current_malla)
} else {
	d3.select('#goToHome').attr('href', '/?m=' + current_malla)
	d3.select('#goToCalculator').attr('href', '/prioridad/?m=' + current_malla)

}

let creditSystem = 'USM'
if (sct) {
	creditSystem = 'SCT'
}
d3.select('#credits-system').text(creditSystem)


let height = 730 * scaleX,
	width = 1570 * scaleY;

canvas = canvas.append("svg")
		.attr('width', width)
		.attr('height', height);

const carreras = {
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
};

/* ---------- axis ---------- */
const drawer = canvas.append('g')
	.attr('transform', 'translate(10, 20)');

let globalY = 0;
let globalX = 0;
let _semester = 1;
const _s = ["I", "II", "III", "IV", "V", 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

const malla = {};
var all_ramos = {};
const all_sectors = {};
let total_creditos = 0;
let total_ramos = 0;
let id = 1;

$("#carrera, .carrera").text(carreras[current_malla]);

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

function getLightPercentage(colorHex) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (colorHex.length === 4) {
      r = "0x" + colorHex[1] + colorHex[1];
      g = "0x" + colorHex[2] + colorHex[2];
      b = "0x" + colorHex[3] + colorHex[3];
    } else if (colorHex.length === 7) {
      r = "0x" + colorHex[1] + colorHex[2];
      g = "0x" + colorHex[3] + colorHex[4];
      b = "0x" + colorHex[5] + colorHex[6];
    }
    // console.log(r,g,b)
    // Then to HSL
	let rgb = [0, 0, 0];
    rgb[0] = r / 255;
    rgb[1] = g / 255;
    rgb[2] = b / 255;

    for (let color in rgb) {
        if (rgb[color] <= 0.03928) {
            rgb[color] /= 12.92
        } else {
            rgb[color] = Math.pow(((rgb[color] + 0.055) / 1.055), 2.4)
        }

    }

    // c <= 0.03928 then c = c/12.92 else c = ((c+0.055)/1.055) ^ 2.4
    let l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    // console.log(l)
    return l <= 0.6;
}

function main_function(error, data, colorBySector) {
	let semester;
	if (error) {
		console.log(error);
		$(".canvas").prepend("<h1>OPS!, malla no encontrada, <a href='http://labcomp.cl/~saedo/apps/viz/ramos'>Volver al inicio</a></h1>");
		return;
	}
	// load the data
	let longest_semester = 0;
	for (semester in data) {
		malla[semester] = {};

		if (data[semester].length > longest_semester)
			longest_semester = data[semester].length;
	// let thisRamoUnlocks = {}
		data[semester].forEach(function(ramo) {
			malla[semester][ramo[1]] = new tipoRamo(ramo[0], ramo[1], ramo[2], ramo[3], (function() {
				if (ramo.length > 4) {
					// ramo[4].forEach( function (sigla) {
					// 	if (thisRamoUnlocks[sigla]){
					// 		thisRamoUnlocks[sigla].add(ramo[0])
					// 	} else {
					// 		thisRamoUnlocks[sigla] = new Set(ramo[0])
					// 	}
					// })
					return ramo[4];
				}
				return [];
					
			})(), id++, colorBySector);
			
			all_ramos[ramo[1]] = malla[semester][ramo[1]];
			if (personal){
				all_ramos[ramo[1]].prer.forEach(function(ramo) {
					all_ramos[ramo].addReq()
				});
			}
			let creditos = ramo[2]
			if (sct) {
				creditos = Math.ceil(creditos * 1.6)
			}
			total_creditos += creditos;
            total_ramos++;
		});
		// for ramo 
	}
	for (let sector in colorBySector) {
		all_sectors[sector] = colorBySector[sector]
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
		let color_description = d3.select(".color-description").append("div")
			.attr("style", "display:flex;vertical-align:middle;margin-right:15px;");
		let circle_color = color_description.append("svg")
			.attr("height", "25px")
			.attr("width", "25px");
		circle_color.append("circle")
			.attr("r", 10)
			.attr("cx", 12)
			.attr("cy", 12)
			.attr("fill", colorBySector[key][0]);

		color_description.append("span").text(colorBySector[key][1]);

	});

	for (semester in malla) {
		globalY = 0;
		// draw the axis
		drawer.append("rect")
			.attr("x", globalX)
			.attr("y", globalY)
			.attr("width", 120 * scaleX)
			.attr("height", 30 * scaleY)
			.attr("fill", 'gray')
			.classed('bars', true);


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
		}
		globalX += 130 * scaleX;
	}
	drawer.selectAll(".ramo-label")
		.call(wrap, 115 * scaleX, (100 - 100/5*2) * scaleY);

	// verificar cache
	if (!(prioridad || personal)) {
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
		for (let semester in malla) {
			for (let ramo in malla[semester]) {
				malla[semester][ramo].verifyPrer();
			}
		}

		let current_credits = 0;
        let current_ramos = APPROVED.length;
		APPROVED.forEach(function(ramo) {
			let creditos = ramo.creditos
			if (sct) {
				creditos = Math.ceil(creditos * 1.6)
			}
			current_credits += creditos;
		});
		d3.select(".info").select("#creditos").text(`${current_credits} (${parseInt((current_credits/total_creditos)*100)}%), Total ramos: ${parseInt(current_ramos*100/total_ramos)}%`);
	}, 30);

	// filling the cache!
	d3.interval(function() {
		if ((!(prioridad || personal))) { 
		let willStore = [];
		APPROVED.forEach(function(ramo) {
			willStore.push(ramo.sigla);
		});
		localStorage[cache_variable] = willStore;
		}
	}, 2000);

    // if (prioridad || personal) {
    var first_time = d3.select(canvas.node().parentNode); // volvemos a canvas/ priori-canvas
	first_time = first_time.append("div")
	  .classed("row no-gutters bg-light justify-content-center", true)
	  .attr("id", "overlay")
	  .append("div");
	first_time.classed("col", true)
	.style("max-width","650px");
	first_time.append('h3')
	  .classed('text-center py-5 px-3', true)
	  .text(function() {
			if (personal)
				return welcomeTitle;
			return welcomeTitle + carreras[current_malla] + '!'
		});
	first_time.append("img")
	  .property("src","/data/ramo.svg")
	  .style("width", "300px");
	first_time.append("h5")
	  .classed("text-center py-5 px-3", true)
	  .text(welcomeDesc);
	first_time = d3.select(first_time.node().parentNode);
	// } else {
	// var first_time = canvas.append("g")
	// first_time.append("rect")
	// 	.attr("x", 0)
	// 	.attr("y", 0)
	// 	.attr("width", width)
	// 	.attr("height", height)
	// 	.attr("fill", "white")
	// 	.attr("opacity", 0.9);
	// first_time.append("text")
	// 	.attr("x", width/2)
	// 	.attr("y", height/2 - 180 * scaleY)
	// 	.attr("dy", 0)
	// 	.attr("text-anchor", "middle")
	// 	.attr("font-size", 40* scaleX)
	// 	.attr("opacity", 0.01)
	// 	.text( function() {
	// 		if (personal)
	// 			return welcomeTitle
	// 		return welcomeTitle + carreras[current_malla] + "!"; 
	// 	})
	// 	.transition().duration(800)
	// 	.attr("y", height/2)
	// 	.attr("opacity", 1)
	// 	.call(wrap, 900 * scaleX, height);
	// first_time.append("text")
	// 	.attr("x", width/2)
	// 	.attr("y", height/2 - 90 * scaleY)
	// 	.attr("dy", "2.1em")
	// 	.attr("text-anchor", "middle")
	// 	.attr("font-size", 30*scaleX)
	// 	.attr("opacity", 0.01)
	// 	.text(welcomeDesc)
	// 	.transition().duration(800)
	// 	.attr("y", height/2)
	// 	.attr("opacity", 1)
	// 	.call(wrap, 900 * scaleX, height);
	// }
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
					if (line.length === 1) {
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
			let tspans = text.selectAll('tspan');
			for (let index = 0; index < textLines; index++) {
				let tspan = tspans._groups[0][index];
				tspan.setAttribute('dy', lineNumber++ + dy + 'em');
				
			}
		}
  });
}

function limpiarRamos() {
	for (let i = APPROVED.length - 1; i >= 0; i--) {
		APPROVED[i].approveRamo();
	}
}

function changeCreditsSystem()
{
	let key = 'SCT'
	let value = 'true'
	const params = new URLSearchParams(window.location.search);
	if (params.has(key)) {
		value = !('true' == params.get(key))
	}
    key = encodeURI(key); value = encodeURI(value);
    var kvp = document.location.search.substr(1).split('&');

    var i=kvp.length; var x; while(i--) 
    {
        x = kvp[i].split('=');

        if (x[0]==key)
        {
            x[1] = value;
            kvp[i] = x.join('=');
            break;
        }
    }

    if(i<0) {kvp[kvp.length] = [key,value].join('=');}

    //this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&'); 
}