/* PC: Plan común */
var colorBySector = {
	'PC': '#00838F',
	'FI': '#2E58A7'
};

function Ramo(nombre, sigla, creditos, sector) {
	this.nombre = nombre;
	this.sigla = sigla;
	this.creditos = creditos;
	this.sector = sector;
	let self = this;

	this.draw = function(canvas, posX, posY, size) {
		var ramo = canvas.append('g')
			.attr('id', self.sigla);
		var graybar = size/5;

		ramo.append("rect")
			.attr("x", posX)
			.attr("y", posY)
			.attr("width", size)
			.attr("height", size)
			.attr("fill", colorBySector[sector]);

		ramo.append("rect")
			.attr("x", posX)
			.attr("y", posY)
			.attr("width", size)
			.attr("height", graybar)
			.attr("fill", '#6D6E71');

		ramo.append("rect")
			.attr("x", posX)
			.attr("y", posY + size - graybar)
			.attr("width", size)
			.attr("height", graybar)
			.attr("fill", '#6D6E71');
		
		ramo.append("text")
			.attr("x", posX + size/2)
			.attr("y", posY + size/2)
			.text(self.nombre)
			.attr("font-family", 'sans-serif')
			.attr("fill", "white")
			.attr("font-size", 12)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", 'middle');



		return;
	}
}
