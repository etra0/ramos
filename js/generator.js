var semestre = 1;
var mallaCustom
var custom_ramos = new Set();
var ramosSemestres;
var customRamosProps = {}
var editedPrer = new Set()
var customSectors = {}

function start_generator() {
    // los ramos fuera de malla se cargan primero
    mallaCustom = "Custom-" + current_malla;
    if (localStorage[mallaCustom + "_CUSTOM"]) {
        customRamosProps = JSON.parse(localStorage[mallaCustom + "_CUSTOM"]);

        for (var sigla in customRamosProps) {
            // inicializar ramos fuera de malla
            let datosRamo = customRamosProps[sigla]
            let prer = []
            if (datosRamo.length == 6) {
                prer = datosRamo[5]
            }
            let ramo = new CustomRamo(datosRamo[0],datosRamo[1],datosRamo[2],datosRamo[3],prer, id,datosRamo[4]);
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

    // New!
    let groupCache = localStorage[mallaCustom + '-sectors'] 
    if (groupCache) {
        customSectors = JSON.parse(localStorage[mallaCustom + '-sectors'])
        for (let sector in customSectors) {
            all_sectors[sector] = customSectors[sector]
        }
    } else {
        customSectors['CUSTOM'] = ["#000000", "Fuera de la malla oficial"] 
        all_sectors['CUSTOM'] = customSectors['CUSTOM'] 
    }
    fillSector()


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

    // redireccion
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

    let sector = {"CUSTOM": all_sectors['CUSTOM']}
    let customRamo = [nombre,sigla, creditos, 'CUSTOM' ,sector, []]
    let ramo = new CustomRamo(nombre, sigla, creditos, 'CUSTOM', [], id, sector)
    id++
    all_ramos[sigla] = ramo;
    customRamosProps[sigla] = customRamo;
    custom_ramos.add(sigla);
    localStorage[mallaCustom+'_CUSTOM'] = JSON.stringify(customRamosProps)
    ramo.selectRamo();
    $('#crearRamoModal').modal('hide')


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


// Crear ramo avanzado
function fillSelections() {
    // fillSector()
    let sectorSelector = d3.select('#elegirSector')
    for (sector in all_sectors) {
        let sectorName = all_sectors[sector][1]
        let selection = sectorSelector.append('option');
        selection.attr('value', sector)
        .text(sectorName)
    }
    let ramosSelectors = [d3.select('#agregarPreRequisitos'), d3.select('#agregarConvalidaciones')]
    for (let selector in ramosSelectors) {
        ramosSelectors[selector].append('option')
            .attr('value', '0')
            .text('Elige los ramos')    
    }
    for (let ramo in all_ramos) {
        let nombreRamo = all_ramos[ramo].nombre
        let siglaRamo = ramo
        for (let selector in ramosSelectors) {
            let selection = ramosSelectors[selector].append('option');
            selection.attr('onclick', 'addTo(' + ramosSelectors[selector].attr("id") + ',' + ramo + ')')
                .attr('value', siglaRamo)
                .text(nombreRamo)
        }
    }

}
//
function addTo(id) {
    let toBeAdded, siglaRamo, selectionId, checked
    checked = $('#advEditorEnabler').prop('checked')
    if (d3.select('#editorEnablerDiv').classed('d-none')){
        checked = null
    } else if (checked) {
        checked = null
    } else {
        checked = true
    }
    if (id == "agregarPreRequisitos") {
        toBeAdded = d3.select('#preRequisitos').append('li');
        siglaRamo = $('#agregarPreRequisitos').val()
        editedPrer.add(siglaRamo)
        d3.select('#agregarPreRequisitos').select('[value="' + siglaRamo + '"]')
            .attr('disabled', true)
        $('#agregarPreRequisitos').val(0)
        selectionId = "pre-" + siglaRamo
    } else if (id == "agregarConvalidaciones") {
        toBeAdded = d3.select('#convalidaciones').append('li');
        siglaRamo = $('#agregarConvalidaciones').val()
        d3.select('#agregarConvalidaciones').select('[value="' + siglaRamo + '"]')
        .attr('disabled', true)
        $('#agregarConvalidaciones').val(0)
        selectionId = "con-" + siglaRamo
    }
    nombreRamo = all_ramos[siglaRamo].nombre
    toBeAdded.classed('list-group-item', true)
        .classed('d-flex', true)
        .classed('align-items-center', true)
        .classed('pr-0', true)
        .classed('py-0', true)
        .attr('id','pre-'+ siglaRamo)
    toBeAdded.append('p')
        .classed('flex-grow-1', true)
        .classed('h-100', true)
        .classed('pr-2', true)
        .classed('ml-n2', true)
        .classed('py-2', true)
        .classed('mb-0', true)
        .text(siglaRamo + ' | ' + nombreRamo)
    toBeAdded.append('button')
        .classed('btn', true)
        .classed('btn-danger', true)
        .classed('deleter', true)
        .classed('text-white', true)
        .classed('py-1', true)
        .classed('mr-0', true)
        .attr('disabled', checked)
        .attr('onclick','removeItem( "' + id + '", "' + selectionId + '")')
        .text('Quitar')
}


function editorEnabler(toEnable) {

        if ($('#advEditorEnabler').prop('checked')) {
            // Should delete changes an reload original data
            
            d3.selectAll('.deleter')
            .attr('disabled', null);
            d3.select('#agregarPreRequisitos').attr('disabled', null)
            d3.select('#agregarConvalidaciones').attr('disabled', null)
            d3.select('#elegirSector').attr('disabled', null)
            
        } else {
            // d3.selectAll('.deleter')
            // .attr('disabled', true);
            // d3.select('#agregarPreRequisitos').attr('disabled', true)
            // d3.select('#agregarConvalidaciones').attr('disabled', true)
            // d3.select('#elegirSector').attr('disabled', true)
            let ramo = all_ramos[document.getElementById('custom-siglaa').value]
            loadRamoAdvanced(ramo.sector, ramo.prer)
            
        }
    }

function removeItem(id, idToRemove) {
    // currentSelectionsId = id.slice(7)
    let siglaRamo = idToRemove.slice(4)
    editedPrer.delete(siglaRamo)
    d3.select('#' + id).select('[value="' + siglaRamo + '"]')
    .attr('disabled', null)
    d3.select('#'+ idToRemove).remove()
}

function fillSector() {
    let sectorList = d3.select("#sectors")
    for (var sector in all_sectors) {
        let isTextColorWhite = getLightPercentage(all_sectors[sector][0])
        // console.log(all_sectors[sector][1], all_sectors[sector][0], isTextColorWhite)
        sectorList.append('button')
            .classed('list-group-item', true)
            .classed('list-group-item-action', true)
            .classed('text-white', isTextColorWhite)
            .classed('sector', true)
            .attr('type', 'button')
            .attr('onclick', 'editSector("' + sector + '")')
            .attr('id','sec-' + sector)
            .style('background-color', all_sectors[sector][0])
            .text(all_sectors[sector][1])
        $("#sec-" + sector).hover(function(){
            $(this).css("filter", "brightness(85%)");
            }, function(){
                $(this).css("filter", "brightness(100%)");
        });
    }
}


function editSector(sector) {
    let sectorName = all_sectors[sector][1]
    let sectorColor = all_sectors[sector][0]
    document.getElementById('sectorName').value = sectorName
    document.getElementById('smallSectorName').value = sector
    d3.select('#smallSectorName').attr('disabled', true)
    document.getElementById('sectorColor').value = sectorColor
    d3.select('#crearSector').text('Editar grupo de ramos')
    $('#crearSectorModal').modal('show')
    d3.select("#sectorDoneButton").attr('onclick', 'finishedEditingSector("#sec-' + sector + '")')
}

function finishedEditingSector(sectorId) {
    let sector = document.getElementById('smallSectorName').value
    let sectorColor = document.getElementById('sectorColor').value
    let sectorName = document.getElementById('sectorName').value
    let whiteText = getLightPercentage(sectorColor)
    d3.select(sectorId)
        .classed('text-white', whiteText)
        .style('background-color', sectorColor)
        .text(sectorName)
    $('#crearSectorModal').modal('hide')
    saveSector(sector, sectorName, sectorColor)
}


function finishedCreatingSector() {    
    let sectorName = String(document.getElementById('sectorName').value)
    let sectorSmallName = String(document.getElementById('smallSectorName').value)
    let sectorColor = String(document.getElementById('sectorColor').value)
    let isTextColorWhite = getLightPercentage(sectorColor)
    
    d3.select('#sectors').append('button')
        .classed('list-group-item', true)
        .classed('list-group-item-action', true)
        .classed('text-white', isTextColorWhite)
        // .classed('sector', true)
        .attr('type', 'button')
        .attr('onclick', 'editSector("' + sectorSmallName + '")')
        .attr('id','sec-' + sectorSmallName)
        .style('background-color', sectorColor)
        .text(sectorName)
    $("#sec" + sectorSmallName).hover(function(){
        $(this).css("filter", "brightness(85%)");
        }, function(){
            $(this).css("filter", "brightness(100%)");
    });
    
    $('#crearSectorModal').modal('hide')
    saveSector(sectorSmallName, sectorName, sectorColor)

    
}


function editRamo(sigla) {
    d3.select('#titleRamoAvanzado').text('Editar Ramo')
    d3.select('#editorEnablerDiv').classed('d-none', false)
    $('#advEditorEnabler').prop('checked', false)
    let ramo = all_ramos[sigla]
    $('#preChecker').prop('checked', false).prop("disabled", true)
    $('#conChecker').prop('checked', false).prop("disabled", true)
    $('#custom-siglaa').prop("disabled", true)
    $('#crearRamoAvanzado').modal('show')
    
    document.getElementById('custom-siglaa').value = ramo.sigla
    document.getElementById('custom-creditsa').value = ramo.creditos
    document.getElementById('custom-namea').value = ramo.nombre
    d3.select('#advancedRamoButton').attr('onclick','finishedEditingRamo(true)')
    
    loadRamoAdvanced(ramo.sector, ramo.prer)
}



function cleanRamoAdvanced(sectorState, preState, conState) {
    d3.select('#elegirSector').attr('disabled', sectorState).selectAll('option').remove()
    d3.select('#agregarPreRequisitos').attr('disabled', preState).selectAll('option').remove()
    d3.select('#agregarConvalidaciones').attr('disabled', conState).selectAll('option').remove()
    d3.select('#preRequisitos').selectAll('li').remove()
    d3.select('#convalidaciones').selectAll('li').remove()
}

function loadRamoAdvanced(sector, prer, conv=new Set()) {

    cleanRamoAdvanced(true, true, true)
    fillSelections()

    d3.select('#elegirSector').select('[value="'+sector+'"]').attr('selected', true)
    prer.forEach( function(ramo) {
        $('#agregarPreRequisitos').val(ramo)
        addTo("agregarPreRequisitos")
    });
    conv.forEach( function(ramo) {
        $('#agregarConvalidaciones').val(ramo)
        addTo("agregarConvalidaciones")
    });
}

function finishedEditingRamo(bool) {
    sigla = document.getElementById('custom-siglaa').value
    ramoToApplyEdits = all_ramos[sigla]
    ramoToApplyEdits.nombre = document.getElementById('custom-namea').value
    ramoToApplyEdits.creditos = Number(document.getElementById('custom-creditsa').value)
    if ($('#advEditorEnabler').prop('checked')) {
        ramoToApplyEdits.sector = $('#elegirSector').val()
        ramoToApplyEdits.prer = new Set(editedPrer)
    }
    let customizedRamo = ['','','','','','']

        customizedRamo[0] = ramoToApplyEdits.nombre
        customizedRamo[1] = ramoToApplyEdits.sigla
        customizedRamo[2] = ramoToApplyEdits.creditos
        customizedRamo[3] = ramoToApplyEdits.sector
            
        let fakeColorBySector = {[customizedRamo[3]] : all_sectors[customizedRamo[3]]}
        customizedRamo[4] = fakeColorBySector
        customizedRamo[5] = Array.from(ramoToApplyEdits.prer)

        customRamosProps[sigla] = customizedRamo;
        custom_ramos.add(sigla);
        localStorage[mallaCustom+'_CUSTOM'] = JSON.stringify(customRamosProps)
            // cleanRamoAdvanced(null, null, null)

        $('#crearRamoAvanzado').modal('hide')

}


function createRamoAdvanced() {

    let sigla = document.getElementById('custom-siglaa').value
    let nombre = document.getElementById('custom-namea').value
    let creditos = Number(document.getElementById('custom-creditsa').value)
    let sector = $('#elegirSector').val()
    let prer = new Set(editedPrer)
    
    let ramo = new CustomRamo(nombre, sigla, creditos, sector, prer, id, all_sectors)
    id++
    all_ramos[sigla] = ramo
    let fakeColorBySector = {[sector]: all_sectors[sector]}
    prer = Array.from(prer)
    let customRamo = [nombre,sigla, creditos, sector , fakeColorBySector, prer]
    custom_ramos.add(sigla)

    // let sector = {"CUSTOM": ["#000000", "Fuera de la malla oficial"]}
    customRamosProps[sigla] = customRamo;
    localStorage[mallaCustom+'_CUSTOM'] = JSON.stringify(customRamosProps)
}

d3.interval(function() {
    updateCustomTable();
    }, 200);




function isColorDark(bgColor) {
    let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    let r = parseInt(color.substring(0, 2), 16); // hexToR
    let g = parseInt(color.substring(2, 4), 16); // hexToG
    let b = parseInt(color.substring(4, 6), 16); // hexToB
    let uicolors = [r / 255, g / 255, b / 255];
    let c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? false : true;
}
// Modal hidden actions
$('#crearRamoModal').on('hidden.bs.modal', function (e) {
    document.getElementById('custom-name').value = ''
    document.getElementById('custom-sigla').value = ''
    document.getElementById('custom-credits').value = ''
  })

$('#crearRamoAvanzado').on('hidden.bs.modal', function (e) {
    document.getElementById('custom-namea').value = ''
    document.getElementById('custom-siglaa').value = ''
    document.getElementById('custom-creditsa').value = ''
    d3.select('#custom-siglaa').attr('disabled', null)
    d3.select('#titleRamoAvanzado').text('Añadir ramo: Advanced Edition')
    editedPrer.clear()
    d3.select('#editorEnablerDiv').classed('d-none', true)
    d3.select('#advancedRamoButton').attr('onclick','createRamoAdvanced()')
    cleanRamoAdvanced(null,null,null)

  })

  $('#crearSectorModal').on('hidden.bs.modal', function (e) {
    document.getElementById('sectorColor').value = ''
    document.getElementById('sectorName').value = ''
    document.getElementById('smallSectorName').value = ''
    d3.select('#smallSectorName').attr('disabled', null)
    d3.select('#crearSector').text('Añadir grupo de Ramos')
    d3.select('#sectorDoneButton').attr('onclick', 'finishedCreatingSector()')

  })

  // Guardado de sectores y ramos editados

  function saveSector(sectorId, sectorName, sectorColor) {



    




    let sector = [sectorColor, sectorName]
    all_sectors[sectorId] = sector
    customSectors[sectorId] = sector
    let id = mallaCustom + '-sectors'
    localStorage.setItem(id, JSON.stringify(customSectors));
  }