/* PC: Plan común
 * FI: Fundamentos de Informática
 * HUM: Humanistas, libres y deportes
 * TIN: Transversal e Integración
 * SD: Sistemas de decisión informática
 * IND: Industrias
 */
var colorBySector = {
	'PC': '#00838F',
	'FI': '#2E58A7',
	'HUM': '#B0B91D',
	'TIN': '#C54B73',
	'SD': '#991B1E',
	'IND': '#6BA8D1',
	'IS': '#FDDE15',
	'TIC': '#6D57A5'
};

function Ramo(nombre, sigla, creditos, sector) {
	this.nombre = nombre;
	this.sigla = sigla;
	this.creditos = creditos;
	this.sector = sector;
	let approved = false;
	let self = this;

	this.draw = function(canvas, posX, posY, size) {
		var ramo = canvas.append('g')
			.attr('id', self.sigla);
		var graybar = size/5;

		ramo.append("rect")
			.attr("x", posX)
			.attr("y", posY)
			.attr("width", size*1.1)
			.attr("height", size)
			.attr("fill", colorBySector[sector]);

		// above bar
		ramo.append("rect")
			.attr("x", posX)
			.attr("y", posY)
			.attr("width", size*1.1)
			.attr("height", graybar)
			.attr("fill", '#6D6E71');

		// below bar
		ramo.append("rect")
			.attr("x", posX)
			.attr("y", posY + size - graybar)
			.attr("width", size*1.1)
			.attr("height", graybar)
			.attr("fill", '#6D6E71');

		// credits rect
		ramo.append("rect")
			.attr("x", posX + size - 23)
			.attr("y", posY + size - graybar + 1)
			.attr("width", 19)
			.attr("height", 18)
			.attr("fill", 'white');
		ramo.append("text")
			.attr("x", posX + size - 17)
			.attr("y", posY + size - 6)
			.text(self.creditos)
			.attr("font-family", "sans-serif")
			.attr("font-weight", "regular")
			.attr("fill", "black")
			.attr("font-size", 12);
			
		
		ramo.append("text")
			.attr("x", posX + size*1.1/2)
			.attr("y", posY + size/2)
			.text(self.nombre)
			.attr("class", "ramo-label")
			.attr("font-family", 'sans-serif')
			.attr("fill", function() {
				if (self.sector != 'IS')
					return "white";
				return '#6D6E71';
			})
			.attr("font-size", 13)
			.attr("text-anchor", "middle")
			.attr("dy", 0)

		ramo.append("text")
			.attr("x", posX + 2)
			.attr("y", posY + size/7)
			.text(self.sigla)
			.attr("font-family", "sans-serif")
			.attr("font-weight", "bold")
			.attr("fill", "white")
			.attr("font-size", 12);

		ramo.append("rect")
			.attr("x", posX)
			.attr("y", posY)
			.attr("width", size*1.1)
			.attr("height", size)
			.attr("fill", 'none')
			.attr("class", "invisible");

		var cross = ramo.append('g').attr("class", "cross").attr("opacity", 0);

		cross.append("path")
			.attr("d", "M" + posX + "," + posY + "L" + (posX+size*1.1) + "," + (posY+size))
			.attr("stroke", "black")
			.attr("stroke-width", 9);

		ramo.on('mouseover', function() {
				d3.select(this).select(".invisible").attr("fill", "rgba(255, 255, 255, 0.6)");
		}).on('mouseout', function() {
				d3.select(this).select(".invisible").attr("fill", "none");
		});

		ramo.on('click', function() {
			if (!approved) {
				d3.select(this).select(".cross").transition().delay(20).attr("opacity", "1");
			} else {
				d3.select(this).select(".cross").transition().delay(20).attr("opacity", "0.01");
			}
			approved = !approved;
		});

		return;
	}
}
