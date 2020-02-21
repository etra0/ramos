var APPROVED = [];
var SELECTED = [];


function CustomRamo(nombre, sigla, creditos, sector, prer=[], id, colorBySector) {
	this.base = SelectableRamo
	this.base(nombre, sigla, creditos, sector, prer, id, colorBySector) 
	// var selected = false;
	let self = this;
	this.isAPrer = false
	this.prerOf = new Set()

	// let ramo;
	
	// NEW!!!
	this.selectRamo = function() {
		
		if (self.isApproved()) { // Si el ramo esta aprobado, no se selecciona
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
				.classed('d-flex', true)
				.classed('align-items-center', true)
				.classed('py-0', true)
				.classed('pr-0', true)
				.style('opacity','0.01')
				.transition().duration(300).style('opacity','1')
			let left = card.append('div');
			left.classed('flex-grow-1', true)
				.classed('mr-3', true)
				.classed('py-2', true)
				.text(self.nombre);
			let rigth = card.append('button');
			rigth.classed('btn', true)
				.classed('btn-warning', true)
				.classed('text-white', true)
				.classed('align-self-stretch', true)
				.attr('type','button')
				.attr('onclick','editRamo("' + self.sigla + '")')
				.text('Editar');
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