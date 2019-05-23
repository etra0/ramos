var semestre = 1;
var custom_ramos = new Set();
var customRamosProps = {}
var ramosSemestre = [];
var notasSemestres;
var faeSemestres;
// Todos estos valores son con los datos del semestre anterior a calcular
var creditosTotales = 0;
var creditosAprovados = 0;
var sumaNotasCreditos = 0
var factorActividadExt = 1;
var mallaPriori
function start_priorix() {
    // los ramos fuera de malla se cargan primero
    mallaPriori = "prioridad-" + current_malla;
    if (localStorage[mallaPriori + "_CUSTOM"]) {
        customRamosProps = JSON.parse(localStorage[mallaPriori + "_CUSTOM"]);

        for (var sigla in customRamosProps) {
            // inicializar ramos fuera de malla
            let datosRamo = customRamosProps[sigla]
            let ramo = new SelectableRamo(datosRamo[0],datosRamo[1],datosRamo[2],datosRamo[3],[],id,datosRamo[4]);
            id++;
            all_ramos[sigla] = ramo
            custom_ramos.add(sigla)
        }
    }
    let cache = localStorage[mallaPriori + '_SEMESTRES'];
    if (cache) {
        notasSemestres = JSON.parse(cache)
    } else {
        notasSemestres = {}
    }
    cache = localStorage[mallaPriori + '_FAE']
    if (cache) {
        faeSemestres = JSON.parse(cache)
    } else {
        faeSemestres = {}
    }
    loadSemester();
    updateCustomTable();
    // Cargar ramos fuera de malla
    var card = d3.select('#priorix');
    if (semestre == 1) {
        d3.select('#back').attr('disabled', 'disabled');
    }
    card.select('#semestre').text(semestre);
}


function calcularPrioridad() {
    // Calculo prioridad
    factorActividadExt = document.getElementById('fae').value;
    var creditosTotalesSemestre = creditosTotales;
    var creditosAprovadosSemestre = creditosAprovados;
    var sumaNotasCreditosSemestre = sumaNotasCreditos;
    SELECTED.forEach(ramo => {
        let nota = Number(document.getElementById('nota-' + ramo.sigla).value)
        sumaNotasCreditosSemestre += nota * ramo.creditos;
        creditosTotalesSemestre += ramo.creditos;
        if (nota > 54) {
            creditosAprovadosSemestre += ramo.creditos;
        }
    });
    saveSemester();
    let prioridad = 100 * (sumaNotasCreditosSemestre/(14 * Math.pow(semestre,1.06))) * (creditosAprovadosSemestre/creditosTotalesSemestre) * factorActividadExt;
    // Mostrar resultado
    prioridad = Math.round(prioridad * 100) / 100.0
    if (d3.select('#resPrioridad').select('div')._groups[0][0]) {
        d3.select('#resPrioridad').select('h4').text('Tu prioridad en S' + semestre + ' es: ' + prioridad)
    } else {
    
    d3.select('#resPrioridad').attr('style', 'height:auto')
     .append('div')
      .classed("alert text-center alert-info alert-dismissible fade show mb-2 pb-2", true)
      .attr('id','calculo')
      .attr('role', 'alert')
      .append('h4')
        .classed('alert-heading', true)
        .text('Tu prioridad en S' + semestre + ' es: ' + prioridad);
    d3.select('#resPrioridad').select('div')
      .append('button')
      .classed('close', true)
      .attr('type', 'button')
      .attr('data-dismiss','alert')
      .attr('aria-label','close')
      .append('span')
        .attr('aria-hidden','true')
        .html("&times;");
    $('#calculo').alert()
    $('#calculo').on('closed.bs.alert', function () {
      })
    }
    console.log(creditosAprovadosSemestre, creditosTotalesSemestre, sumaNotasCreditosSemestre);

    return [creditosTotalesSemestre, creditosAprovadosSemestre, sumaNotasCreditosSemestre, prioridad];
}
$(document).ready(function(){
    });

// recalculo de valores para calculo prioridad semestre
function valoresSemestresAnteriores() {
    sumaNotasCreditos = 0
    creditosAprovados = 0
    creditosTotales = 0
    for ( var s = 1 ; s < semestre; s++) {
        let semestre = notasSemestres[s];
        for (var sigla in semestre) {
            ramo = all_ramos[sigla];
            sumaNotasCreditos += semestre[sigla] * ramo.creditos;
            creditosTotales += ramo.creditos;
            if (semestre[sigla] > 54)
                creditosAprovados += ramo.creditos;       
        }
    }
}

function semestreAnterior() {
    if (semestre == 1) return;
    d3.select('#back').attr('onclick', null);
    semestre--
    valoresSemestresAnteriores();
    limpiarSemestre();
    setTimeout(function(){ // Tiempo para que se limpie la calculadora
        loadSemester();
        d3.select('#semestre').text(semestre);
        if (semestre == 1)
            d3.select('#back').attr('disabled', 'disabled');    
        d3.select('#back').attr('onclick', 'semestreAnterior()');
    }, 350)
}

function proximoSemestre() {
    d3.select('#forward').attr('onclick', null);
    let valoresPrioridad = calcularPrioridad();
    creditosTotales = valoresPrioridad[0];
    creditosAprovados = valoresPrioridad[1];
    sumaNotasCreditos =valoresPrioridad[2];
    saveSemester();
    ++semestre
    let ramos = []
    SELECTED.forEach(ramo => {
    ramos.push(ramo);
    });
    var hayProximoSemestre = notasSemestres[semestre + 1];
    var delay = 300
    ramos.forEach(ramo => {
        if (Number(document.getElementById('nota-' + ramo.sigla).value) > 54) {
            ramo.selectRamo();
            ramo.approveRamo();
        } else  if (hayProximoSemestre) {
            ramo.selectRamo();
            d3.select("#" + ramo.sigla).select(".selected").transition().duration(150).attr('stroke','yellow')
              .transition().duration(150).attr("opacity", ".8")
              .transition().duration(150).attr("opacity", ".5")
              .transition().duration(150).attr("opacity", ".8")
              .transition().duration(150).attr("opacity", ".001")
              .attr('stroke','green');
            delay = 760;
        } else {
            d3.select("#" + ramo.sigla).select(".selected").transition().duration(150).attr('stroke','red')
                .transition().duration(150).attr("opacity", ".5")
                .transition().duration(150).attr("opacity", ".8")
                .transition().duration(150).attr("opacity", ".5")
                .transition().duration(150).attr("opacity", ".8")
                .attr('stroke','green');
            delay = 760;
        }
    });
    d3.select('#semestre').text(semestre);
    if (semestre == 2) 
        d3.select('#back').attr('disabled', null);
        setTimeout(function(){ // Tiempo para que se limpie la calculadora
            loadSemester();
            d3.select('#forward').attr('onclick', 'proximoSemestre()');

        }, delay)
    
}

function saveSemester() {
    let id = mallaPriori + '_SEMESTRES';
    // Guardar notas
    var notasDelSemestre = {}
    SELECTED.forEach(ramo => {
        notasDelSemestre[ramo.sigla] = Number(document.getElementById('nota-' + ramo.sigla).value);
    });
    notasSemestres[semestre] = notasDelSemestre
    localStorage.setItem(id, JSON.stringify(notasSemestres));

    // Guardar FAE
    id = mallaPriori + '_FAE'
    faeSemestres[semestre] = factorActividadExt;
    localStorage.setItem(id, JSON.stringify(faeSemestres));
}

function loadSemester() {
    var toLoad = notasSemestres[semestre]
    var faeToLoad = faeSemestres[semestre];
    if (toLoad) {
        for (var sigla in toLoad) {
            var ramo = all_ramos[sigla]
            if (!ramo.isSelected()) {
                if (ramo.isApproved()) 
                    ramo.approveRamo();
                ramo.selectRamo();
                d3.select('#nota-' + sigla).attr('value', toLoad[sigla]);
            }
        }
        document.getElementById('fae').value = faeToLoad;
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
    document.getElementById('fae').value = 1;
}

function limpiarCalculadora() {
    creditosTotales = 0
    creditosAprovados = 0
    sumaNotasCreditos = 0
    limpiarSemestre();
    let ramos = [];
    APPROVED.forEach(ramo => {
        ramos.push(ramo);
    });
    ramos.forEach(ramo => {
        ramo.approveRamo();
    });
    notasSemestres = {}
    faeSemestres = {}

    
    localStorage[mallaPriori + '_SEMESTRES'] = JSON.stringify({})
    localStorage[mallaPriori + '_FAE'] = JSON.stringify({})
    document.getElementById('fae').value = 1;
    semestre = 1
    d3.select('#back').attr('disabled', 'disabled');
    d3.select('#semestre').text(semestre);
    let customSiglas = Array.from(custom_ramos.values());
    customSiglas.forEach(sigla => {
        borrarRamo(sigla);
    });

}
// Ramos custom
function crearRamo() {
    let nombre, sigla, creditos;

    nombre = document.getElementById('custom-name').value;
    sigla = document.getElementById('custom-sigla').value;
    creditos = document.getElementById('custom-credits').value;

    let sector = {"CUSTOM": ["#000000", "Fuera de la malla oficial"]}
    let customRamo = [nombre,sigla, creditos, 'CUSTOM' ,sector]
    let ramo = new SelectableRamo(nombre, sigla, Number(creditos), 'CUSTOM', [], id, sector)
    id++
    all_ramos[sigla] = ramo;
    customRamosProps[sigla] = customRamo;
    custom_ramos.add(sigla);
    localStorage[mallaPriori+'_CUSTOM'] = JSON.stringify(customRamosProps)
    document.getElementById('custom-name').value = null
    document.getElementById('custom-sigla').value = null
    document.getElementById('custom-credits').value = null
    ramo.selectRamo();
    $('#crearRamoModal').modal('hide');
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
    localStorage[mallaPriori+'_CUSTOM'] = JSON.stringify(customRamosProps)
    saveSemester();
}

function updateCustomTable(){
    let table = d3.select('#customTableContent');
	custom_ramos.forEach(ramo => {
        let approved = 0;
        let selected = false;
        ramo = all_ramos[ramo];
        let fila = d3.select('#CUSTOM-' + ramo.sigla)
        let cursadoEn = [];
        
        SELECTED.forEach(selectedRamo => {
            if (selectedRamo == ramo)
            selected = true;
        });
        for (var s in notasSemestres) {
            if (notasSemestres[s][ramo.sigla] != null && notasSemestres[s][ramo.sigla] > 54) {
                if (Number(s) != semestre)
                approved = s
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
            if (selected) {
                fila.append('td').attr('id','state-' + ramo.sigla).text('Seleccionado')
            } else if (approved) {
                fila.append('td').attr('id','state-' + ramo.sigla).text('Aprobado en S' + approved)
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

            } else if (approved) {
                acciones.append('button')
                  .attr('id','add-'+ ramo.sigla)
                  .attr('class','btn btn-secondary')
                  .attr('type','button')
                  .attr('onclick','all_ramos["'+ ramo.sigla+'"].selectRamo()')
                  .attr('disabled','disabled')
                  .text('Seleccionar Ramo');
                acciones.append('button')
                  .attr('id','delete-'+ ramo.sigla)
                  .attr('class','btn btn-danger')
                  .attr('type','button')
                  .attr('onclick','borrarRamo("'+ ramo.sigla + '")')
                  .attr('disabled','disabled')
                  .text('Eliminar Ramo');
            } else {
                acciones.append('button')
                  .attr('id','add-'+ ramo.sigla)
                  .attr('class','btn btn-secondary')
                  .attr('type','button')
                  .attr('onclick','all_ramos["'+ ramo.sigla+'"].selectRamo()')
                  .text('Seleccionar Ramo');
                for (s in notasSemestres) {
                    if (notasSemestres[s][ramo.sigla] != null && s!=semestre) {
                        cursadoEn.push(s)
                    } 
                }
                if (cursadoEn.lenght) {
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
            if (selected) {
                state.text('Seleccionado')
                addButton.attr('disabled', null).text('De-Seleccionar Ramo');
                deleteButton.attr('disabled',null);

            } else if (approved) {
                state.text('Aprobado en S' + approved)                
                addButton.attr('disabled','disabled').text('Seleccionar Ramo');
                deleteButton.attr('disabled','disabled');
            } else {
                state.text('No Seleccionado')
                for (var s in notasSemestres) {
                    if (notasSemestres[s][ramo.sigla] != null && s!=semestre) {
                        cursadoEn.push(s)
                    } 
                }
                addButton.attr('disabled', null).text('Seleccionar Ramo');
                if (cursadoEn.lenght) {
                } else {
                    deleteButton.attr('disabled', null);
                }
            }
        } 
    });
}

d3.interval(function() {
    updateCustomTable();
    }, 200);

