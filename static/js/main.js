// // Escucha cambios en las casillas de verificación
// document.querySelectorAll('input[CheckboxMantenimiento="fecha_mantenimiento"], input[CheckboxMantenimiento="fecha_calibracion"]').forEach(function(checkbox) {
//     checkbox.addEventListener('change', function() {
//         console.log('Checkbox clickeado');
//         const productoId = this.getAttribute('data-producto-id');
//         const estadoInicial = this.getAttribute('data-estado-inicial');
//         const CheckboxMantenimiento = this.getAttribute('CheckboxMantenimiento');
//         const nombreEquipo = this.getAttribute('data-nombre-equipo');
//         const ubicacionOriginal = this.getAttribute('data-ubicacion-original');
//         const periodicidadMantenimiento = this.getAttribute('data-periodicidad-mantenimiento');
//         const fechaMantenimiento = this.getAttribute('data-fecha-mantenimiento');
//         const vencimientoMantenimiento = this.getAttribute('data-vencimiento-mantenimiento');
//         const periodicidadCalibracion = this.getAttribute('data-periodicidad-calibracion');
//         const fechaCalibracion = this.getAttribute('data-fecha-calibracion');
//         const vencimientoCalibracion = this.getAttribute('data-vencimiento-calibracion');
//         const nuevoEstado = this.checked ? 'Activo' : 'Inactivo';

//         // Confirmar con el usuario antes de enviar la solicitud
//         if (confirm(`¿Cambiar el estado del equipo ${productoId} a ${nuevoEstado}?`)) {
//             // Enviar solicitud POST para actualizar el estado y guardar en el historial
//             fetch('/checkbox_programacionMantenimiento', {
//                 method: "POST",
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-CSRFToken': csrf_token
//                 },
//                 body: JSON.stringify({
//                     productoId: productoId,
//                     nuevoEstado: nuevoEstado,
//                     CheckboxMantenimiento: CheckboxMantenimiento,
//                     nombreEquipo: nombreEquipo,
//                     ubicacionOriginal: ubicacionOriginal,
//                     periodicidadMantenimiento: periodicidadMantenimiento,
//                     fechaMantenimiento: fechaMantenimiento,
//                     vencimientoMantenimiento: vencimientoMantenimiento,
//                     periodicidadCalibracion: periodicidadCalibracion,
//                     fechaCalibracion: fechaCalibracion,
//                     vencimientoCalibracion: vencimientoCalibracion
//                 })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     alert(data.message || "Fechas guardadas en el historial.");
//                     this.checked = nuevoEstado === 'Activo';
//                 } else {
//                     if (data.codigo === 'MENOS_30_DIAS') {
//                         alert(data.message);
//                         this.checked = false;
//                     } else {
//                         alert(data.message || "Error al actualizar el estado o guardar en el historial.");
//                     }
//                     this.checked = estadoInicial === 'Activo';
//                 }
//             })

//             .catch(error => {
//                 console.error('Error en la solicitud:', error);
//                 this.checked = estadoInicial === 'Activo';
//             });
//         } else {
//             // Si el usuario cancela, restaura el estado inicial
//             this.checked = estadoInicial === 'Activo';
//         }
//     });
// });
// ==================================================================================================
// Actualizar masivamente desde los checkbox y boton guardar historial
const btnGuardar = document.getElementById('guardarSeleccionados');

if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
    const proveedorId = document.getElementById('selectProveedor').value;
    const personaId = document.getElementById('selectPersona').value;
    const observacionesId = document.getElementById('selectObservaciones').value;
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
            ubicacionOriginal: cb.getAttribute('data-ubicacion-original'),
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
