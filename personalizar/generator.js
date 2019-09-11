var semestre = 1;
var mallaCustom
var custom_ramos = new Set();
var ramosSemestres;
var customRamosProps = {}
function start_generator() {
    // los ramos fuera de malla se cargan primero
    mallaCustom = "Custom-" + current_malla;
    if (localStorage[mallaCustom + "_CUSTOM"]) {
        customRamosProps = JSON.parse(localStorage[mallaCustom + "_CUSTOM"]);

        for (var sigla in customRamosProps) {
            // inicializar ramos fuera de malla
            let datosRamo = customRamosProps[sigla]
            let ramo = new SelectableRamo(datosRamo[0],datosRamo[1],datosRamo[2],datosRamo[3],[],id,datosRamo[4]);
            id++;
            all_ramos[sigla] = ramo
            custom_ramos.add(sigla)
        }
    }
    let cache = localStorage[mallaCustom + '_SEMESTRES'];
    if (cache) {
        ramosSemestres = JSON.parse(cache)
    } else {
        ramosSemestres = {}
    }
    
    loadSemester();
    updateCustomTable();
    var card = d3.select('#priorix');
    if (semestre == 1) {
        d3.select('#back').attr('disabled', 'disabled');
    }
    card.select('#semestre').text(semestre);
}

function generate() {
    var ramosDelSemestre = []
    SELECTED.forEach(ramo => {
        ramosDelSemestre.push(ramo.sigla);
    });
    ramosSemestres[semestre] = ramosDelSemestre
    // Verificacion ramos duplicados
    let ramosCursados = new Set()
    let sem = 0
    for (var s in ramosSemestres) {
        sem++;
        let ramosDuplicados = [];
        ramosSemestres[s].forEach(ramo => {
            if (ramosCursados.has(ramo)) {
                ramosDuplicados.push(ramo)
            } else {
                ramosCursados.add(ramo)
            }
        });
        ramosDuplicados.forEach(ramo => {
            let i = ramosSemestres[s].indexOf(ramo);
            ramosSemestres[s].splice(i,1)
        })
    }
    // Limpieza de semestres inutiles
    while (ramosSemestres[sem].length == 0) {
        delete ramosSemestres[sem]
        sem--
    }
    // guardado
    let id = mallaCustom + '_SEMESTRES';
    localStorage.setItem(id, JSON.stringify(ramosSemestres));
    localStorage.setItem(mallaCustom + '_CUSTOM', JSON.stringify(customRamosProps))

    window.location.href = "malla.html?m=" + current_malla;
}




function semestreAnterior() {
    if (semestre == 1) return;
    d3.select('#back').attr('onclick', null);
    semestre--
    limpiarSemestre();
    setTimeout(function(){ // Tiempo para que se limpie la calculadora
        loadSemester();
        d3.select('#semestre').text(semestre);
        if (semestre == 1) {
            d3.select('#back').attr('disabled', 'disabled');
        } else if (semestre == 19) {
            d3.select('#forward').attr('disabled', null);
        }
        d3.select('#back').attr('onclick', 'semestreAnterior()');
    }, 350)
}

function proximoSemestre() {
    d3.select('#forward').attr('onclick', null);
    saveSemester();
    ++semestre
    let ramos = []
    SELECTED.forEach(ramo => {
    ramos.push(ramo);
    });
    var delay = 300
    ramos.forEach(ramo => {
        ramo.selectRamo();
        ramo.approveRamo()
    });
    d3.select('#semestre').text(semestre);
    if (semestre == 2) {
        d3.select('#back').attr('disabled', null);
    } else if (semestre == 20) {
        d3.select('#forward').attr('disabled','disabled')
    }
    setTimeout(function(){ // Tiempo para que se limpie la calculadora
        loadSemester();
        d3.select('#forward').attr('onclick', 'proximoSemestre()');

    }, delay)
    
}

function saveSemester() {
    let id = mallaCustom + '_SEMESTRES';
    // Guardar ramos
    var ramosDelSemestre = []
    SELECTED.forEach(ramo => {
        ramosDelSemestre.push(ramo.sigla);
    });
    ramosSemestres[semestre] = ramosDelSemestre
    localStorage.setItem(id, JSON.stringify(ramosSemestres));
    localStorage.setItem(mallaCustom + '_CUSTOM', JSON.stringify(customRamosProps))

}

function loadSemester() {
    var toLoad = ramosSemestres[semestre]
    if (toLoad) {
        toLoad.forEach(sigla => {
            let ramo = all_ramos[sigla]
            if (ramo.isApproved())
                ramo.approveRamo()
            ramo.selectRamo()
        });
    }

}


function limpiarSemestre() {
    let ramos = []
    SELECTED.forEach(ramo => {
    ramos.push(ramo);
    });
    ramos.forEach(ramo => {
        ramo.selectRamo();
    });
}

function limpiarCalculadora() {
    limpiarSemestre();
    let ramos = [];
    APPROVED.forEach(ramo => {
        ramos.push(ramo);
    });
    ramos.forEach(ramo => {
        ramo.approveRamo();
    });
    ramosSemestres = {}

    
    localStorage[mallaCustom + '_SEMESTRES'] = JSON.stringify({})
    semestre = 1
    d3.select('#back').attr('disabled', 'disabled');
    d3.select('#semestre').text(semestre);
    d3.select('#forward').attr('disabled',null);
    let customSiglas = Array.from(custom_ramos.values());
    customSiglas.forEach(sigla => {
        borrarRamo(sigla);
    });

}
// Ramos custom
function crearRamo() {
    let nombre, sigla, creditos;

    nombre = String(document.getElementById('custom-name').value);
    sigla = String(document.getElementById('custom-sigla').value);
    creditos = Number(document.getElementById('custom-credits').value);

    let sector = {"CUSTOM": ["#000000", "Fuera de la malla oficial"]}
    let customRamo = [nombre,sigla, creditos, 'CUSTOM' ,sector]
    let ramo = new SelectableRamo(nombre, sigla, Number(creditos), 'CUSTOM', [], id, sector)
    id++
    all_ramos[sigla] = ramo;
    customRamosProps[sigla] = customRamo;
    custom_ramos.add(sigla);
    localStorage[mallaCustom+'_CUSTOM'] = JSON.stringify(customRamosProps)
    ramo.selectRamo();
    $('#crearRamoModal').modal('hide')
    document.getElementById('custom-name').value = null
    document.getElementById('custom-sigla').value = null
    document.getElementById('custom-credits').value = null

}

function borrarRamo(sigla) {
    SELECTED.forEach(ramo => {
        if (ramo.sigla == sigla)
            ramo.selectRamo();
    });
    let ramo = all_ramos[sigla]
    delete all_ramos[ramo.sigla];
    custom_ramos.delete(ramo.sigla)
    delete customRamosProps[ramo.sigla];
    d3.select('#CUSTOM-' + ramo.sigla).remove();
    localStorage[mallaCustom+'_CUSTOM'] = JSON.stringify(customRamosProps)
    saveSemester();
}

function updateCustomTable(){
    let table = d3.select('#customTableContent');
	custom_ramos.forEach(ramo => {
        let selected = false;
        let semesterSelected;
        ramo = all_ramos[ramo];
        let fila = d3.select('#CUSTOM-' + ramo.sigla)
        
        SELECTED.forEach(selectedRamo => {
            if (selectedRamo == ramo)
            selected = true;
        });
        for (var s in ramosSemestres) {
            if (ramosSemestres[s].indexOf(ramo.sigla) != -1 && Number(s) != semestre) {
                semesterSelected = s
                break;
            }
        }
        
        if (!fila._groups[0][0]) {
            let acciones;
            fila = table.append('tr');

            fila.attr('id','CUSTOM-'+ ramo.sigla);
            fila.append('th')
              .attr('scope','row')
              .text(ramo.sigla);
            fila.append('td')
              .text(ramo.nombre)
            fila.append('td')
              .text(ramo.creditos);
            if (semesterSelected) {
                if (semestre == semesterSelected) {
                    fila.append('td').attr('id','state-' + ramo.sigla).text('Seleccionado')
                } else {
                    fila.append('td').attr('id','state-' + ramo.sigla).text('Seleccionado S'+ semesterSelected)
                }
            } else if (selected) {
                fila.append('td').attr('id','state-' + ramo.sigla).text('Seleccionado')
            } else {
                fila.append('td').attr('id','state-' + ramo.sigla).text('No Seleccionado')
            }
            acciones = fila.append('td').append('div')
            acciones.attr('class', 'btn-group').attr('role','group')
            if (selected) {
                acciones.append('button')
                  .attr('id','add-'+ ramo.sigla)
                  .attr('class','btn btn-secondary')
                  .attr('type','button')
                  .attr('onclick','all_ramos[\"'+ ramo.sigla+'\"].selectRamo()')
                  .text('De-Seleccionar Ramo');
                acciones.append('button')
                  .attr('id','delete-'+ ramo.sigla)
                  .attr('class','btn btn-danger')
                  .attr('type','button')
                  .attr('onclick','borrarRamo("'+ ramo.sigla + '")')
                  .text('Eliminar Ramo');

            } else {
                acciones.append('button')
                  .attr('id','add-'+ ramo.sigla)
                  .attr('class','btn btn-secondary')
                  .attr('type','button')
                  .attr('onclick','all_ramos["'+ ramo.sigla+'"].selectRamo()')
                  .text('Seleccionar Ramo');
                if (semesterSelected) {
                acciones.append('button')
                  .attr('id','delete-'+ ramo.sigla)
                  .attr('class','btn btn-danger')
                  .attr('type','button')
                  .attr('onclick','borrarRamo("'+ ramo.sigla + '")')
                  .attr('disabled','disabled')
                  .text('Eliminar Ramo');
                } else {
                    acciones.append('button')
                      .attr('id','delete-'+ ramo.sigla)
                      .attr('class','btn btn-danger')
                      .attr('type','button')
                      .attr('onclick','borrarRamo("'+ ramo.sigla + '")')
                      .text('Eliminar Ramo');
                }

            }
        } else {
            let state = d3.select('#state-' + ramo.sigla)
            let addButton = d3.select('#add-' + ramo.sigla);
            let deleteButton = d3.select('#delete-' + ramo.sigla);
            if (semesterSelected) {
                if (semestre == semesterSelected) {
                    state.text('Seleccionado')
                    addButton.attr('disabled', null).text('De-Seleccionar Ramo');
                    deleteButton.attr('disabled',null);
                } else {
                    state.text('Seleccionado S'+ semesterSelected)
                    addButton.attr('disabled', 'disabled').text('Seleccionar Ramo');
                    deleteButton.attr('disabled', 'disabled');
                }
            } else if (selected) {
                state.text('Seleccionado')
                addButton.attr('disabled', null).text('De-Seleccionar Ramo');
                deleteButton.attr('disabled',null);
            } else {
                state.text('No Seleccionado')
                addButton.attr('disabled', null).text('Seleccionar Ramo');
                deleteButton.attr('disabled', null);
            }
        }
    });
}

d3.interval(function() {
    updateCustomTable();
    }, 200);

