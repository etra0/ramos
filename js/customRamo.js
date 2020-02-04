var APPROVED = [];
var SELECTED = [];

// Clase hijo de ramo, al clickear el ramo, este se selecciona en vez de aprobar
// Aprobar el ramo sigue siendo posible,
// pero ahora queda a discreción del desarrollador el como accionarlo
function CustomRamo(nombre, sigla, creditos, sector, prer=[], id, colorBySector) {
	this.base = SelectableRamo
	this.base(nombre, sigla, creditos, sector, prer, id, colorBySector) 
	// var selected = false;
	let self = this;
	// let ramo;
	
	// NEW!!!
	this.selectRamo = function() {
		
		if (self.isApproved()) { // Si el ramo esta aprovado, no se selecciona
			if (!custom_ramos.has(this.sigla)) {
				d3.select("#" + self.sigla).select(".selected").attr('stroke','red');
				d3.select("#" + self.sigla).select(".selected").transition().duration(200).attr("opacity", ".8")
					.transition().duration(150).attr("opacity", ".5")
					.transition().duration(150).attr("opacity", ".8")
					.transition().duration(200).attr("opacity", ".001")
					.attr('stroke','green');
			}
			return;
		}
		
		if (!self.selected) { // Ramo se ha seleccionado
			if (!custom_ramos.has(this.sigla))
			d3.select("#" + self.sigla).select(".selected").transition().delay(20).attr("opacity", ".8");
			SELECTED.push(self);
			let card = d3.select('#ramos').append('li');
			card.attr('id','per-' + self.sigla)
				.classed('list-group-item', true)
				.style('opacity','0.01')
				.text(self.nombre)
				.transition().duration(300).style('opacity','1')
			
			
		} else { // Ramo ya no esta seleccionado
			if (!custom_ramos.has(this.sigla))
			d3.select("#" + self.sigla).select(".selected").transition().delay(20).attr("opacity", "0.01");
			d3.select("#per-" + self.sigla).transition().duration(300).style('opacity','0.01').remove()
			let _i = SELECTED.indexOf(self)
			if (_i > -1) {
				SELECTED.splice(_i, 1);
			}
			
		}
		self.selected = !self.selected;
	}
	
}

CustomRamo.prototype = SelectableRamo