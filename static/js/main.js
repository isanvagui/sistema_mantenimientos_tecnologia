// ==================================================================================================
// ✅ GESTIÓN MASIVA DE MANTENIMIENTOS PREVENTIVOS Y CORRECTIVOS TECNOLOGÍA
// ==================================================================================================

document.addEventListener("DOMContentLoaded", () => {
    const btnGuardar = document.getElementById("guardarSeleccionados");
    const modalElement = document.getElementById("modalGuardar");
    const selectPersona = document.getElementById("selectPersona");
    const selectUbicacion = document.getElementById("selectUbicacion");

    // 🟩 1️⃣ Evento principal del botón "Guardar seleccionados"
    if (btnGuardar) {
        btnGuardar.addEventListener("click", async () => {
            const proveedorId = document.getElementById("selectProveedor").value.trim();
            const personaId = selectPersona.value.trim();
            const observacionesId = document.getElementById("selectObservaciones").value.trim();
            const ubicacionId = selectUbicacion.value.trim();
            const nuevaFecha = document.getElementById("nuevaFecha").value.trim();
            const nuevaPeriodicidad = document.getElementById("nuevaPeriodicidad").value.trim();
            const correoExterno = document.getElementById("inputCorreo").value.trim();

            // ⚙️ Validaciones
            const errores = [];
            if (!proveedorId) errores.push("Debe seleccionar un técnico responsable.");
            if (!nuevaFecha) errores.push("Debe seleccionar la fecha de ejecución.");
            if (!nuevaPeriodicidad) errores.push("Debe ingresar una nueva periodicidad.");
            if (!correoExterno) errores.push("Debe ingresar un correo para notificación.");

            if (errores.length > 0) return alert(errores.join("\n"));

            // 🧩 Recolectar los equipos seleccionados
            const seleccionados = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => ({
                productoId: cb.dataset.productoId,
                tipo: cb.getAttribute("CheckboxMantenimiento"),
                nombreEquipo: cb.dataset.nombreEquipo,
                periodicidad: cb.dataset.periodicidadMantenimiento || cb.dataset.periodicidadCalibracion || "",
                fecha: cb.dataset.fechaMantenimiento || cb.dataset.fechaCalibracion || "",
                vencimiento: cb.dataset.vencimientoMantenimiento || cb.dataset.vencimientoCalibracion || ""
            }));

            if (seleccionados.length === 0) return alert("Debe seleccionar al menos un equipo.");

            try {
                const response = await fetch("/guardar_historialTecnologia", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrf_token
                    },
                    body: JSON.stringify({
                        proveedorId,
                        personaId,
                        observacionesId,
                        ubicacionId,
                        nuevaFecha,
                        nuevaPeriodicidad,
                        correoExterno,
                        registros: seleccionados
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Error al guardar los datos");

                alert(data.message || "Guardado exitoso.");

                // ✅ Cerrar el modal automáticamente
                if (modalElement) {
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) modalInstance.hide();
                }

                // ✅ Limpiar campos del modal y desmarcar checkboxes
                [
                    "selectProveedor",
                    "selectPersona",
                    "selectObservaciones",
                    "selectUbicacion",
                    "nuevaFecha",
                    "nuevaPeriodicidad",
                    "inputCorreo"
                ].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = "";
                });

                document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => (cb.checked = false));

                // ✅ Refrescar la vista
                setTimeout(() => location.reload(), 800);
            } catch (error) {
                console.error("❌ Error:", error);
                alert("Ocurrió un error al guardar los datos. Por favor intente nuevamente.");
            }
        });
    }

    // ==================================================================================================
    // 🟨 2️⃣ ACTUALIZAR AUTOMÁTICAMENTE PERSONA Y UBICACIÓN AL SELECCIONAR CHECKBOX
    // ==================================================================================================
    const checkboxes = document.querySelectorAll(
        'input[CheckboxMantenimiento="fecha_mantenimiento"], input[CheckboxMantenimiento="fecha_calibracion"]'
    );

    checkboxes.forEach(checkbox => {
        const tipo = checkbox.getAttribute("CheckboxMantenimiento");
        const estadoInicial = checkbox.getAttribute("data-estado-inicial");
        const vencimiento =
            checkbox.getAttribute("data-vencimiento-mantenimiento") ||
            checkbox.getAttribute("data-vencimiento-calibracion");

        // 🔸 Desactivar automáticamente equipos vencidos
        if (estadoInicial === "Activo" && vencimiento) {
            const diasRestantes = calcularDiasRestantes(vencimiento);
            if (diasRestantes < 30) {
                checkbox.checked = false;
                checkbox.setAttribute("data-estado-inicial", "Inactivo");
                fetch("/checkbox_programacionMantenimiento", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrf_token
                    },
                    body: JSON.stringify({
                        productoId: checkbox.dataset.productoId,
                        nuevoEstado: "Inactivo",
                        CheckboxMantenimiento: tipo
                    })
                })
                    .then(res => res.json())
                    .then(data => console.log("⚙️ Desactivado automáticamente:", data.message))
                    .catch(err => console.error("Error auto-desactivación:", err));
            }
        }

        // 🔸 NUEVO: al marcar un checkbox → obtener persona responsable y ubicación del equipo
        checkbox.addEventListener("change", async function () {
            if (this.checked) {
                const idEquipo = this.dataset.productoId;

                try {
                    const res = await fetch(`/get_datos_persona/${idEquipo}`);
                    const data = await res.json();

                    if (data.success) {
                        if (data.persona_id && selectPersona)
                            selectPersona.value = data.persona_id;

                        if (data.ubicacion_id && selectUbicacion)
                            selectUbicacion.value = data.ubicacion_id;

                        console.log(`📍 Datos cargados para equipo ${idEquipo}:`, data);
                    } else {
                        console.warn(`⚠️ No se encontraron datos para equipo ${idEquipo}`);
                    }
                } catch (error) {
                    console.error(`Error al obtener datos del equipo ${idEquipo}:`, error);
                }
            }
        });
    });

    // ==================================================================================================
    // 🔹 FUNCIÓN AUXILIAR
    // ==================================================================================================
    function calcularDiasRestantes(fechaStr) {
        const hoy = new Date();
        const fecha = new Date(fechaStr);
        const diff = fecha - hoy;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
});
