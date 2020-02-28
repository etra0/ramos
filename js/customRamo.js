//const APPROVED = [];
//const SELECTED = [];


function CustomRamo(nombre, sigla, creditos, sector, prer=[], id, colorBySector) {
	this.base = SelectableRamo;
	this.base(nombre, sigla, creditos, sector, prer, id, colorBySector);
	// var selected = false;
	let self = this;
	let prerOfCounter = 0;
	this.prerOf = new Set();
	
	// let ramo;
	
	// NEW!!!
		this.addReq = function() {
			prerOfCounter++
		};
		this.removeReq = function() {
			prerOfCounter--
		};
		this.isAPrer = function() {
			return !!prerOfCounter;
		};
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
				.transition().duration(300).style('opacity','1');
			let left = card.append('div');
			left.classed('flex-grow-1', true)
				.classed('mr-3', true)
				.classed('py-2', true)
				.text(self.nombre);
			let rigth = card.append('button');
			rigth.classed('btn', true)
				.classed('btn-warning', true)
				// .classed('text-white', true)
				.classed('align-self-stretch', true)
				.attr('type','button')
				.attr('onclick','editRamo("' + self.sigla + '")')
				.text('Editar');
		} else { // Ramo ya no esta seleccionado
			if (!custom_ramos.has(this.sigla))
			d3.select("#" + self.sigla).select(".selected").transition().delay(20).attr("opacity", "0.01");
			d3.select("#per-" + self.sigla).transition().duration(300).style('opacity','0.01').remove();
			let _i = SELECTED.indexOf(self);
			if (_i > -1) {
				SELECTED.splice(_i, 1);
			}
			
		}
		self.selected = !self.selected;
	};

	this.addToCustomTable = function() {
		let table = d3.select('#customTableContent');

		let acciones;
		let fila = table.append('tr');

        fila.attr('id','CUSTOM-'+ self.sigla);
        fila.append('th')
            .attr('scope','row')
            .text(self.sigla);
		fila.append('td')
			.attr('id', 'C-name-' + self.sigla)
			.text(self.nombre);
			fila.append('td')
			.attr('id', 'C-credits-' + self.sigla)
            .text(self.creditos);
        if (self.selected) {
            fila.append('td').attr('id','state-' + self.sigla).text('Seleccionado')
        } else {
            fila.append('td').attr('id','state-' + self.sigla).text('No Seleccionado')
		}

		let preText = '';
		self.prer.forEach(sigla => {
			if (preText === '') {
				preText = sigla
			} else {
				preText += ', ' + sigla
			}
		});


		fila.append('td')
			.attr('id', 'C-prer-' + self.sigla)
			.text(preText);
        acciones = fila.append('td').append('div');
		acciones.attr('class', 'btn-group').attr('role','group');
		let selectedStateText = 'Seleccionar Ramo';
        if (self.selected) {
			selectedStateText = "De-Seleccionar Ramo"
		}
		acciones.append('button')
			.attr('id','add-'+ self.sigla)
			.attr('class','btn btn-secondary')
			.attr('type','button')
			.attr('onclick','all_ramos["'+ self.sigla+'"].selectRamo()')
			.text(selectedStateText);
		if (self.isCustom) {
			acciones.append('span')
				// .classed('d-inline-block', true)
				.attr('tabindex', '0')
				.attr('id', 'deletetip-'+ self.sigla)
				.attr('data-toggle','tooltip')
				.attr('data-placement','top')
				.attr('title','El ramo esta asignado a otro semestre o es pre-requisito de otro')
				.append('button')
				.style('pointer-events','none')
				.style('border-radius','0 3px 3px 0')
				.attr('id','delete-'+ self.sigla)
				.attr('class','btn btn-danger')
				.attr('type','button')
				.attr('onclick','deleteRamofromTable("'+ self.sigla + '")')
				.text('Eliminar Ramo');
			$('[data-toggle="tooltip"]').tooltip()
		}
	}
}


CustomRamo.prototype = SelectableRamo;