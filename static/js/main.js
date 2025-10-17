
// ==================================================================================================
// Actualizar masivamente desde los checkbox y boton guardar historial
const btnGuardar = document.getElementById('guardarSeleccionados');

if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
    const proveedorId = document.getElementById('selectProveedor').value;
    const personaId = document.getElementById('selectPersona').value;
    const observacionesId = document.getElementById('selectObservaciones').value;
    const ubicacionId = document.getElementById('selectUbicacion').value;
    const nuevaFecha = document.getElementById('nuevaFecha').value;
    const nuevaPeriodicidad = document.getElementById('nuevaPeriodicidad').value

    if (!proveedorId) {
        alert('Debe seleccionar un proveedor responsable');
        return;
    }

        if (!nuevaFecha) {
        alert('Debe seleccionar fecha de ejecución');
        return;
    }

        if (!nuevaPeriodicidad){
        alert('Debe seleccionar nueva periodicidad');
        return;
    }

    const seleccionados = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        const tipo = cb.getAttribute('CheckboxMantenimiento');
        seleccionados.push({
            productoId: cb.getAttribute('data-producto-id'),
            tipo: tipo,
            nombreEquipo: cb.getAttribute('data-nombre-equipo'),
            // ubicacionOriginal: cb.getAttribute('data-ubicacion-original'),
            periodicidad: tipo === 'fecha_mantenimiento' ? cb.getAttribute('data-periodicidad-mantenimiento') : cb.getAttribute('data-periodicidad-calibracion'),
            fecha: tipo === 'fecha_mantenimiento' ? cb.getAttribute('data-fecha-mantenimiento') : cb.getAttribute('data-fecha-calibracion'),
            vencimiento: tipo === 'fecha_mantenimiento' ? cb.getAttribute('data-vencimiento-mantenimiento') : cb.getAttribute('data-vencimiento-calibracion'),
        });
    });

    if (seleccionados.length === 0) {
        alert('No hay equipos seleccionados.');
        return;
    }

    fetch('/guardar_historialTecnologia', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        },
        body: JSON.stringify({
            proveedorId: proveedorId,
            personaId: personaId,
            observacionesId: observacionesId,
            ubicacionId: ubicacionId,
            nuevaFecha: nuevaFecha,
            nuevaPeriodicidad: nuevaPeriodicidad,
            registros: seleccionados
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Guardado exitoso')
        // ✅ Limpiar campos después del guardado
        document.getElementById('selectProveedor').value = '';
        document.getElementById('selectPersona').value = '';
        document.getElementById('selectObservaciones').value = '';
        document.getElementById('selectUbicacion').value = '';
        document.getElementById('nuevaFecha').value = '';
        document.getElementById('nuevaPeriodicidad').value = '';
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
    })
    .catch(error => console.error(error));
});
}
// ===========================================================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('input[CheckboxMantenimiento="fecha_mantenimiento"], input[CheckboxMantenimiento="fecha_calibracion"]').forEach(function(checkbox) {
        const tipo = checkbox.getAttribute('CheckboxMantenimiento');
        const estadoInicial = checkbox.getAttribute('data-estado-inicial');
        const vencimiento = checkbox.getAttribute('data-vencimiento-mantenimiento') || checkbox.getAttribute('data-vencimiento-calibracion');

        if (estadoInicial === 'Activo' && vencimiento) {
            const diasRestantes = calcularDiasRestantes(vencimiento);

            if (diasRestantes < 30) {
                checkbox.checked = false;
                checkbox.setAttribute('data-estado-inicial', 'Inactivo');

                fetch('/checkbox_programacionMantenimiento', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrf_token
                    },
                    body: JSON.stringify({
                        productoId: checkbox.getAttribute('data-producto-id'),
                        nuevoEstado: 'Inactivo',
                        CheckboxMantenimiento: tipo,
                        nombreEquipo: checkbox.getAttribute('data-nombre-equipo'),
                        ubicacionOriginal: checkbox.getAttribute('data-ubicacion-original'),
                        periodicidadMantenimiento: checkbox.getAttribute('data-periodicidad-mantenimiento'),
                        fechaMantenimiento: checkbox.getAttribute('data-fecha-mantenimiento'),
                        vencimientoMantenimiento: checkbox.getAttribute('data-vencimiento-mantenimiento'),
                        periodicidadCalibracion: checkbox.getAttribute('data-periodicidad-calibracion'),
                        fechaCalibracion: checkbox.getAttribute('data-fecha-calibracion'),
                        vencimientoCalibracion: checkbox.getAttribute('data-vencimiento-calibracion')
                    })
                })
                .then(res => res.json())
                .then(data => {
                    console.log("Desactivado automáticamente:", data.message);
                });
            }
        }
    });

    function calcularDiasRestantes(fechaStr) {
        const hoy = new Date();
        const fecha = new Date(fechaStr);
        const diff = fecha - hoy;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
});
