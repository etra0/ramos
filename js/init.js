/**
 * Obtencion de archivos JS de manera paralela y carga sincronica
 */
//loadjs(['https://kit.fontawesome.com/bf671ef02a.js', 'https://cdn.jsdelivr.net/npm/sweetalert2@8', 'https://cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.min.js', '/js/ramos.js', '/js/selectableRamo.js', '/js/calculator.js', '/js/canvas.js'], 'init');
/*loadjs.ready('init', {
    success: function() { console.log("Recursos cargados") },
    error: function(depsNotFound) {
        Swal.fire(
            "Fallo al cargar",
            "Tuvimos problemas al cargar algunas dependencias... el sitio se recargara en 5 segundos.",
            "error"
        );
        setTimeout(function(){
            location.reload();
        }, 5000);
    },
});*/

function contactar() {
    window.location = "mailto:sebastian.aedo@sansano.usm.cl"
    $('#contacto').modal('hide')
}

function render(props) {
    return function(tok, i) {
        return (i % 2) ? props[tok] : tok;
    };
}

$.getJSON('/data/carreras.json', function(data) {
    $.each(data, function(index, value) {
        let tabTpl1 = $('script[data-template="tab-template1"]').text().split(/\${(.+?)}/g);
        let tabTpl2 = $('script[data-template="tab-template2"]').text().split(/\${(.+?)}/g);
        value = [value];
        $('#carreras1-nav').append(value.map(function (value) {
            return tabTpl1.map(render(value)).join('');
        }));
        $('#carreras2-nav').append(value.map(function (value) {
            return tabTpl2.map(render(value)).join('');
        }));
    });
});