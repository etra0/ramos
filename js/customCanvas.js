// Cambie las variables scale para aumentar o reducir las dimensiones de la malla
// Se recomienda fuertemente valores NO MENORES a 0.5
let scaleX, scaleY, canvas, tipoRamo;

// variables de mensaje
let welcomeTitle, welcomeDesc;

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

d3.select('#goToHome').attr('href', '/?m=' + current_malla)
d3.select('#goToGenerator').attr('href', '/personalizar/?m=' + current_malla)
let creditSystem = 'USM'
if (sct) {
	creditSystem = 'SCT'
}
d3.select('#credits-system').text(creditSystem)

	scaleX = 1;
	scaleY = 1;
	canvas = d3.select(".canvas");
	tipoRamo = Ramo;
	welcomeTitle = `¡Bienvenido a tu propia malla!`;
	welcomeDesc = `Puedes tachar tus ramos aprobados haciendo click sobre ellos.
	A medida que vas aprobando ramos, se van liberando los que tienen prerrequisitos.
	Haz click en cualquier lado para comenzar.`;


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
// Soporte hasta 20 semestres
const _s = [
	"I",
	"II",
	"III",
	"IV",
	"V",
	'VI',
	'VII',
	'VIII',
	'IX',
	'X',
	'XI',
	'XII',
	'XIII',
	'XIV',
	'XV',
	'XVI',
	'XVII',
	'XVII',
	'XIX',
	'XX'
];

const malla = {};
const all_ramos = {};
let total_creditos = 0;
let total_ramos = 0;
let id = 1;








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
	.defer(d3.json, "../data/data_" + current_malla + ".json")
	.defer(d3.json, "../data/colors_" + current_malla + ".json")
  .await(main_function);

function main_function(error, data, colorBySector) {
	let semester;
	let sigla;
	if (error) {
		console.log(error);
		$(".canvas").prepend("<h1>OPS!, malla no encontrada, <a href='http://labcomp.cl/~saedo/apps/viz/ramos'>Volver al inicio</a></h1>");
		return;
	}
	// load the data
	
	// Agregado de sectores fuera de malla
	let customCache = JSON.parse(localStorage['Custom-'+ current_malla + '_CUSTOM']);
	for (sigla in customCache) {
		// una parte es para acceder al diccionario que contiene las propiedades del sector
		colorBySector[customCache[sigla][3]] = customCache[sigla][4][customCache[sigla][3]]
		// la otra parte es la sigla para acceder
	}
	
	let longest_semester = 0;
	for (semester in data) {
		data[semester].forEach(function(ramo) {
			all_ramos[ramo[1]] = new tipoRamo(ramo[0], ramo[1], ramo[2], ramo[3], (function() {
				if (ramo.length > 4)
				return ramo[4];
				return [];
			})(), id++, colorBySector)

		});
	}
	
	// agregado de ramos fuera de malla
	let customRamosProps = JSON.parse(localStorage['Custom-' + current_malla +"_CUSTOM"]);
	for (sigla in customRamosProps) {
		// inicializar ramos fuera de malla
		let datosRamo = customRamosProps[sigla];
		let prer = [];
        if (datosRamo.length === 6) {
            prer = datosRamo[5]
		}
		let ramo = new Ramo(datosRamo[0],datosRamo[1], Number(datosRamo[2]),datosRamo[3],prer, id,colorBySector);
		id++;
		
		all_ramos[sigla] = ramo
	}
	
	let customMalla = JSON.parse(localStorage['Custom-' + current_malla + '_SEMESTRES']);
	const ramosInMalla = new Set();
	let newId = 1
	let sectorsUsed = new Set();
	for (let semester in customMalla) {
		let c = 0;
		customMalla[semester].forEach(siglaRamo => {
			ramosInMalla.add(siglaRamo)
			all_ramos[siglaRamo].id = newId

			newId++;
			c++;
			let creditos = all_ramos[siglaRamo].creditos
			if (sct) {
				creditos = Math.ceil(creditos * 1.6)
			}
			total_creditos += creditos;
			total_ramos++;
			sectorsUsed.add(all_ramos[siglaRamo].sector) 

		})
		if (c > longest_semester)
		longest_semester = c;

	}
	for (let ramo in all_ramos) {
		if (!ramosInMalla.has(ramo)) {
			delete all_ramos[ramo]
		} else {
			all_ramos[ramo].prer.forEach(sigla =>{
				if (!ramosInMalla.has(sigla)) {
					all_ramos[ramo].prer.delete(sigla)
				}
			})
		}
	}
	
	// se crea la malla de acorde al usuario
	// let newId = 1;
	// for (semester in customMalla) {
	// 	malla[semester] = {};
	// 	customMalla[semester].forEach(siglaRamo => {
	// 		all_ramos[siglaRamo].id = newId;
	// 		newId++;
	// 		malla[semester][siglaRamo] = all_ramos[siglaRamo];
	// 	});
	// }

	// update width y height debido a que varian segun la malla
		// + 10 para evitar ocultamiento de parte de la malla
	width = (130*Object.keys(customMalla).length) * scaleX + 10;
	height = (110*longest_semester + 30 + 25) * scaleY + 10;

	canvas.attr("width", width)
		.attr("height", height);
	drawer.attr("width", width)
		.attr("height", height);

	// colores de la malla
	Object.keys(colorBySector).forEach(key => {
		if (!sectorsUsed.has(key)) {
			return
		}
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

	for (semester in customMalla) {
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

		for (var ramo in customMalla[semester]) {
			all_ramos[customMalla[semester][ramo]].draw(drawer, globalX, globalY, scaleX, scaleY);
			globalY += 110 * scaleY;
		}
		globalX += 130 * scaleX;
	}
	drawer.selectAll(".ramo-label")
		.call(wrap, 115 * scaleX, (100 - 100/5*2) * scaleY);


	// verificar prerrequisitos
	d3.interval(function() {
		for (const semester in customMalla) {
			for (const ramo in customMalla[semester]) {
				all_ramos[customMalla[semester][ramo]].verifyPrer();
			}
		}

		let current_credits = 0;
        let current_ramos = APPROVED.length;
		APPROVED.forEach(function(ramo) {
			let creditos = ramo.creditos
			if (sct) {
				creditos = Math.ceil(creditos * 1.6)
			}
			// total_creditos += creditos;
			current_credits += creditos;
		});
		d3.select(".info").select("#creditos").text(`${current_credits} (${parseInt((current_credits/total_creditos)*100)}%), Total ramos: ${parseInt(current_ramos*100/total_ramos)}%`);
	}, 30);


	let first_time = d3.select(canvas.node().parentNode); // volvemos a canvas/ priori-canvas
	first_time = first_time.append("div")
	  .classed("row no-gutters bg-light justify-content-center", true)
	  .attr("id", "overlay")
	  .append("div");
	first_time.classed("col", true)
	.style("max-width","650px");
	first_time.append('h3')
	  .classed('text-center py-5 px-3', true)
	  .text(welcomeTitle);
	first_time.append("img")
	  .property("src","/data/ramo.svg")
	  .style("width", "300px");
	first_time.append("h5")
	  .classed("text-center py-5 px-3", true)
	  .text(welcomeDesc);
	  first_time = d3.select(first_time.node().parentNode);

	first_time.on('click', function() {
		d3.select(this).transition().duration(200).style('opacity', 0.1).on('end', function() {
			d3.select(this).remove();
		});
	});

	d3.select('#goBack').attr('href','./?m=' + current_malla)


}


function wrap(text, width, height) {
  text.each(function() {
	  let text = d3.select(this),
		  words = text.text().split(/\s+/).reverse(),
		  word,
		  line = [],
		  lineNumber = 0,
		  lineHeight = 1.1, // ems
		  y = text.attr("y"),
		  dy = parseFloat(text.attr("dy")),
		  fontsize = parseInt(text.attr("font-size"), 10),
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