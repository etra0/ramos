var semestre = 1;
// Todos estos valores son con los datos del semestre anterior a calcular
var creditosTotales = 0;
var creditosAprovados = 0;
var sumaNotasCreditos = 0
var factorActividadExt = 1;
var ramosSemestre = [];


function start_priorix() {
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
    let prioridad = 100 * (sumaNotasCreditosSemestre/(14 * Math.pow(semestre,1.06))) * (creditosAprovadosSemestre/creditosTotalesSemestre) * factorActividadExt
    // Mostrar resultado
    console.log(prioridad);
    // La prioridad se guarda por si acaso
    return [creditosTotalesSemestre, creditosAprovadosSemestre, sumaNotasCreditosSemestre, prioridad];
}

function semestreAnterior() {

}

function proximoSemestre() {
    let valoresPrioridad = calcularPrioridad();
    creditosTotales = valoresPrioridad[0];
    creditosAprovados = valoresPrioridad[1];
    sumaNotasCreditos =valoresPrioridad[2];
    ++semestre
    let ramos = []
    SELECTED.forEach(ramo => {
    ramos.push(ramo);
    });
    ramos.forEach(ramo => {
        if (Number(document.getElementById('nota-' + ramo.sigla).value) > 54) {
            ramo.selectRamo();
            ramo.approveRamo();
        } else {
            d3.select("#" + ramo.sigla).select(".selected").transition().duration(150).attr('stroke','red')
                .transition().duration(150).attr("opacity", ".5")
                .transition().duration(150).attr("opacity", ".8")
                .transition().duration(150).attr("opacity", ".5")
                .transition().duration(150).attr("opacity", ".8")
                .attr('stroke','green');
        }
    });

}
    