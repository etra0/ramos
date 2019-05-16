var semestre = 1;
// Todos estos valores son con los datos del semestre anterior a calcular
var creditosTotales = 0;
var creditosAprovados = 0;
var sumaNotasCreditos = 0
var factorActividadExt = 1;
var ramosSemestre = [];
var mallaPriori

function start_priorix() {
    mallaPriori = "prioridad-" + current_malla;
    loadSemester();
    
    // En un momento cargara valores guardados anteriormente
    var card = d3.select('#priorix');
    card.select('#semestre').text(semestre);
}


function calcularPrioridad() {
    // Calculo prioridad
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
    let prioridad = 100 * (sumaNotasCreditosSemestre/(14 * Math.pow(semestre,1.06))) * (creditosAprovadosSemestre/creditosTotalesSemestre) * factorActividadExt
    // Mostrar resultado
    console.log(prioridad);
    // La prioridad se guarda por si acaso
    return [creditosTotalesSemestre, creditosAprovadosSemestre, sumaNotasCreditosSemestre, prioridad];
}

// recalculo de valores para calculo prioridad semestre
function valoresSemestresAnteriores() {
    sumaNotasCreditos = 0
    creditosAprovados = 0
    creditosTotales = 0
    for ( var n in Array(semestre)) {
        if (n+1 == semestre) 
            break;
        let id = mallaPriori + '_' + (n+1);
        let semestre = JSON.parse(localStorage[id]);
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
    semestre--
    valoresSemestresAnteriores();
    limpiarCalculadora();
    loadSemester();
    d3.select('#semestre').text(semestre);
    if (semestre == 1)
        d3.select('#back').attr('disabled', 'disabled');
    }

function proximoSemestre() {
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
    var hayProximoSemestre = localStorage[mallaPriori + '_' + (semestre + 1)];
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
        } else {
            d3.select("#" + ramo.sigla).select(".selected").transition().duration(150).attr('stroke','red')
                .transition().duration(150).attr("opacity", ".5")
                .transition().duration(150).attr("opacity", ".8")
                .transition().duration(150).attr("opacity", ".5")
                .transition().duration(150).attr("opacity", ".8")
                .attr('stroke','green');
        }
    });
    d3.select('#semestre').text(semestre);
    if (semestre == 2) 
        d3.select('#back').attr('disabled', null);
    loadSemester();
}

function saveSemester() {
    let id = mallaPriori + '_' + semestre;
    var willStore = {}
    SELECTED.forEach(ramo => {
        willStore[ramo.sigla] = Number(document.getElementById('nota-' + ramo.sigla).value);
    });
    localStorage.setItem(id, JSON.stringify(willStore));
}

function loadSemester() {
    let id = mallaPriori + '_' + semestre;
    var toLoad = localStorage[id];
    if (toLoad) {
        toLoad = JSON.parse(toLoad);
        for (var sigla in toLoad) {
            var ramo = all_ramos[sigla]
            if (!ramo.isSelected()) {
                if (ramo.isApproved()) 
                    ramo.approveRamo();
                ramo.selectRamo();
                d3.select('#nota-' + sigla).attr('value', toLoad[sigla]);
            }
        }
    }
}


function limpiarCalculadora() {
    let ramos = []
    SELECTED.forEach(ramo => {
    ramos.push(ramo);
    });
    ramos.forEach(ramo => {
        ramo.selectRamo();
    });
}
