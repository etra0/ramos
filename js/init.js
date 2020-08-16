/**
 * Obtencion de archivos JS de manera paralela y carga sincronica
 */
loadjs(['https://kit.fontawesome.com/bf671ef02a.js', 'https://cdn.jsdelivr.net/npm/sweetalert2@8', 'https://cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.min.js', '/js/ramos.js', '/js/selectableRamo.js', '/js/calculator.js', '/js/canvas.js'], 'init');
loadjs.ready('init', {
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
});

function assureMail() {
    Swal.fire({
        title: '¿Estas seguro?',
        text: "Para hacer cambios en alguna malla, primero te invito a mirar el codigo fuente ¡Allí podras encontrar toda la informacion que necesitas!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Contacto Mail'
    }).then((result) => {
        if (result.value) {
            Swal.fire(
                'OK!',
                'Gracias por ponerte en contacto con nosotros :)',
                'success'
            );
            window.location.href = "mailto:sebastian.aedo@sansano.usm.cl";
        }
    })
}

function render(props) {
    return function(tok, i) {
        return (i % 2) ? props[tok] : tok;
    };
}

$.getJSON('/data/carreras.json', function(data) {
    $.each(data, function(index, value) {
        let tabTpl = $('script[data-template="tab-template"]').text().split(/\${(.+?)}/g);
        value = [value];
        $('#carreras-nav').append(value.map(function (value) {
            return tabTpl.map(render(value)).join('');
        }));
    });
});