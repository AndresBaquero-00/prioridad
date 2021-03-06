// Botones
var btnEnviar = document.querySelector('#enviar');
var btnEjecutar = document.querySelector('#ejecutar');
var btnEnviarEjecutar = document.querySelector('#enviar-ejecutar');
var btnReanudar = document.querySelector('#reanudar');
var btnBloquear = document.querySelector('#bloquear');
// Campos de Texto
var txtProceso = document.querySelector('#nombre-proceso');
var txtLlegada = document.querySelector('#tiempo-llegada');
var txtRafaga = document.querySelector('#rafaga');
var txtPrioridad = document.querySelector('#prioridad');
// Contenedores
var divRojo = document.querySelector('#rojo');
var divVerde = document.querySelector('#verde');
var table = document.querySelector('#table');
var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
/**
 * Array que guarda los procesos en una cola de espera.
 */
var procesos = [];
/**
 * Array que guarda los procesos bloqueados.
 */
var bloqueados = [];
/**
 * Contador de procesos.
 */
var i = 0;
/**
* Determina si la sección crítica ejecuta procesos en tiempo real o en bloque.
*/
var ejecutar = false;
/**
* Almacena un estado si la sección crítica cambia de proceso y hay más procesos en la lista de espera.
*/
var hayProcesos = false;
/**
 * Almacena el ultimo proceso registrado.
 */
var lastProceso;
/**
 * Contador de colores.
 */
var cont = 0;
/**
 * Array que almacena los colores que se van a usar para dibujar cada proceso en el diagrama.
 */
var colores = ['red', 'green', 'blue', 'orange', '#7D3C98', 'black'];
/**
 * Almacena la cantidad de segundos que ha trabajado la sección crítica.
 */
var seconds = 0;
/**
 * Almacena el ultimo tiempo de llegada
 */
var lastTimeLlegada = 0;
/**
 * Función que setea la sección crítica a estado ocupado.
 */
var busy = function () {
    divVerde.className = 'verde-inactivo';
    divRojo.className = 'rojo-activo';
};
/**
 * Función que setea la sección crítica a estado desocupado.
 */
var free = function () {
    divVerde.className = 'verde-activo';
    divRojo.className = 'rojo-inactivo';
};
/**
 * Función que permite visualizar el cambio de estado de la sección crítica.
 */
var change = function () {
    hayProcesos = false;
    ejecutar = false;
    free();
    if (1 <= procesos.length) {
        setTimeout(function () { hayProcesos = true; ejecutar = true; }, 1000);
    }
};
/**
 * Función encargada de crear un nuevo proceso a partir de una plantilla.
 * @param { string } nombre Nombre del proceso.
 * @param { number } tiempo_llegada Tiempo de llegada del proceso.
 * @param { number } rafaga Rafaga del proceso.
 * @param { number } prioridad Numero de prioridad del proceso.
 * @returns El proceso con sus respectivos datos.
 */
var crearProceso = function (nombre, tiempo_llegada, rafaga, prioridad) {
    if (nombre === void 0) { nombre = txtProceso.value; }
    if (tiempo_llegada === void 0) { tiempo_llegada = parseInt(txtLlegada.value); }
    if (rafaga === void 0) { rafaga = parseInt(txtRafaga.value); }
    if (prioridad === void 0) { prioridad = parseInt(txtPrioridad.value); }
    var proceso = {
        nombre: nombre,
        tiempo_llegada: tiempo_llegada,
        rafaga: rafaga,
        prioridad: prioridad,
        tiempo_ejecutado: 0,
        tiempo_espera: 0,
        tiempo_comienzo: 0,
        tiempo_final: 0,
        tiempo_retorno: 0,
        bloqueo: {
            tiempo_block: 0,
            tiempo_llegada: 0,
            bloqueado: false
        }
    };
    return proceso;
};
var registrarDatosProceso = function (proceso) {
    if (!lastProceso) {
        proceso.tiempo_comienzo = proceso.tiempo_llegada;
    }
    else {
        proceso.tiempo_comienzo = lastProceso.tiempo_final >= proceso.tiempo_llegada ?
            lastProceso.tiempo_final : proceso.tiempo_llegada;
        if (proceso.bloqueo.bloqueado) {
            proceso.tiempo_comienzo += proceso.bloqueo.tiempo_block;
        }
    }
    proceso.tiempo_final = proceso.tiempo_comienzo + proceso.tiempo_ejecutado;
    proceso.tiempo_retorno = proceso.bloqueo.bloqueado ?
        proceso.tiempo_final - proceso.bloqueo.tiempo_llegada : proceso.tiempo_final - proceso.tiempo_llegada;
    proceso.tiempo_espera += proceso.tiempo_retorno - proceso.tiempo_ejecutado;
    return proceso;
};
/**
 * Función que agrega el proceso en ejecución a la tabla de procesos ejecutados.
 * @param proceso
 */
var registrarProceso = function (proceso) {
    table.children[1].innerHTML +=
        "<tr>\n            <td>".concat(proceso.nombre, "</td>\n            <td>").concat(proceso.tiempo_llegada, "</td>\n            <td>").concat(proceso.rafaga, "</td>\n            <td>").concat(proceso.prioridad, "</td>\n            <td>").concat(proceso.tiempo_comienzo, "</td>\n            <td>").concat(proceso.tiempo_final, "</td>\n            <td>").concat(proceso.tiempo_retorno, "</td>\n            <td>").concat(proceso.tiempo_espera, "</td>\n        </tr>");
};
/**
 * Función que dibuja la recta asociada a cada proceso en el canvas.
 * @param proceso
 */
var dibujarProceso = function (proceso) {
    if (cont === colores.length) {
        cont = 0;
    }
    ctx.strokeStyle = colores[cont];
    cont++;
    /* Dibuja (|) tiempo de llegada */
    ctx.setLineDash([]);
    ctx.beginPath();
    if (proceso.bloqueo.bloqueado) {
        ctx.moveTo(2 + proceso.bloqueo.tiempo_llegada * 10, 2 + 35 * (i + 1));
        ctx.lineTo(2 + proceso.bloqueo.tiempo_llegada * 10, 13 + 35 * (i + 1));
    }
    else {
        ctx.moveTo(2 + proceso.tiempo_llegada * 10, 2 + 35 * (i + 1));
        ctx.lineTo(2 + proceso.tiempo_llegada * 10, 13 + 35 * (i + 1));
    }
    ctx.stroke();
    /* Dibuja (|) tiempo de comienzo */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tiempo_comienzo * 10, 2 + 35 * (i + 1));
    ctx.lineTo(2 + proceso.tiempo_comienzo * 10, 13 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja (|) tiempo ejecutado */
    ctx.beginPath();
    ctx.moveTo(2 + (proceso.tiempo_comienzo + proceso.tiempo_ejecutado) * 10, 2 + 35 * (i + 1));
    ctx.lineTo(2 + (proceso.tiempo_comienzo + proceso.tiempo_ejecutado) * 10, 13 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja linea desde tiempo de llegada hasta tiempo de comienzo (Tiempo Ejecucion) */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tiempo_comienzo * 10, 7.5 + 35 * (i + 1));
    ctx.lineTo(2 + (proceso.tiempo_comienzo + proceso.tiempo_ejecutado) * 10, 7.5 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja linea desde tiempo de llegada hasta tiempo de comienzo (Tiempo Espera) */
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    if (proceso.bloqueo.bloqueado) {
        ctx.moveTo(2 + proceso.bloqueo.tiempo_llegada * 10, 7.5 + 35 * (i + 1));
        ctx.lineTo(2 + proceso.tiempo_comienzo * 10, 7.5 + 35 * (i + 1));
    }
    else {
        ctx.moveTo(2 + proceso.tiempo_llegada * 10, 7.5 + 35 * (i + 1));
        ctx.lineTo(2 + proceso.tiempo_comienzo * 10, 7.5 + 35 * (i + 1));
    }
    ctx.stroke();
};
/**
 * Funcion que permite agregar un proceso a la cola de espera.
 */
var enviarProceso = function () {
    var proceso = crearProceso();
    if (!proceso.nombre || isNaN(proceso.tiempo_llegada) || isNaN(proceso.rafaga)) {
        alert('No se admiten campos vacíos. Intente nuevamente.');
        return;
    }
    if (proceso.tiempo_llegada < lastTimeLlegada) {
        alert("El tiempo del proceso ".concat(proceso.nombre, " debe ser mayor o igual a ").concat(lastTimeLlegada));
        return;
    }
    lastTimeLlegada = proceso.tiempo_llegada;
    procesos.push(proceso);
    txtProceso.value = '';
    txtLlegada.value = '';
    txtRafaga.value = '';
    txtPrioridad.value = '';
    hayProcesos = true;
};
/**
 * Función que se encarga de ejecutar los procesos que están actualmente en la cola de espera.
 */
var ejecutarProceso = function () {
    if (!ejecutar)
        ordenarProcesos();
    ejecutar = true;
};
/**
 * Función que se encarga de agregar un nuevo proceso a la cola de espera en tiempo de ejecución.
 */
var enviarEjecutarProceso = function () {
    enviarProceso();
    ejecutarProceso();
};
/**
 * Función encargada de bloquear un proceso.
 */
var bloquearProceso = function () {
    if (!hayProcesos) {
        return;
    }
    var proceso = registrarDatosProceso(procesos.splice(0, 1)[0]);
    bloqueados.push(proceso);
    registrarProceso(proceso);
    dibujarProceso(proceso);
    change();
    lastProceso = proceso;
    i++;
    alert("El proceso ".concat(proceso.nombre, " ha sido bloqueado."));
};
var ordenarProcesos = function () {
    var p = procesos.sort(function (a, b) {
        if (seconds < a.tiempo_llegada || seconds < b.tiempo_llegada) {
            return 0;
        }
        return a.prioridad - b.prioridad;
    });
    console.log(p);
};
/**
 * Función encargada del manejo de la sección crítica.
 */
var handlerSeccionCritica = function () {
    if (!hayProcesos || !ejecutar) {
        return;
    }
    if (procesos[0].tiempo_ejecutado < procesos[0].rafaga) {
        busy();
        procesos[0].tiempo_ejecutado++;
        seconds++;
    }
    else {
        var proceso = registrarDatosProceso(procesos.splice(0, 1)[0]);
        dibujarProceso(proceso);
        registrarProceso(proceso);
        ordenarProcesos();
        change();
        lastProceso = proceso;
        i++;
    }
};
/**
 * Función encargada del manejo de los procesos bloqueados.
 * El tiempo de bloqueo de un proceso es de 5s.
 */
var handlerColaBloqueo = function () {
    if (bloqueados.length > 0) {
        if (bloqueados[0].bloqueo.tiempo_block < 5) {
            bloqueados[0].bloqueo.tiempo_block++;
        }
        else {
            var proceso_bloqueado = bloqueados.splice(0, 1)[0];
            var proceso_reanudado = crearProceso("".concat(proceso_bloqueado.nombre, "*"), proceso_bloqueado.tiempo_llegada, proceso_bloqueado.rafaga - proceso_bloqueado.tiempo_ejecutado, proceso_bloqueado.prioridad);
            proceso_reanudado.bloqueo.bloqueado = true;
            proceso_reanudado.bloqueo.tiempo_block = proceso_bloqueado.bloqueo.tiempo_block;
            proceso_reanudado.bloqueo.tiempo_llegada = proceso_bloqueado.tiempo_comienzo + proceso_bloqueado.tiempo_ejecutado;
            proceso_reanudado.tiempo_espera = proceso_bloqueado.tiempo_espera;
            procesos.push(proceso_reanudado);
            alert("El proceso ".concat(proceso_bloqueado.nombre, " ha sido desbloqueado."));
            hayProcesos = true;
            ejecutarProceso();
            // 
        }
    }
};
/**
 * Función que dibuja la recta numérica inicial del diagrama.
 */
var iniciarDiagrama = function () {
    ctx.fillStyle = '#F4F6F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.font = '10pt Arial';
    ctx.moveTo(0, 7.5);
    ctx.lineTo(canvas.width, 7.5);
    for (var j = 0; j <= canvas.width / 10; j++) {
        ctx.moveTo(2 + j * 10, 2);
        ctx.lineTo(2 + j * 10, 13);
        ctx.stroke();
        if (j % 5 === 0) {
            if (j >= 10) {
                ctx.fillText(j.toString(), j * 10 - 5, 30);
            }
            else {
                ctx.fillText(j.toString(), j * 10, 30);
            }
        }
    }
};
var seccionCritica = setInterval(handlerSeccionCritica, 1000);
var colaBloqueados = setInterval(handlerColaBloqueo, 1000);
btnEnviar.addEventListener('click', function () {
    enviarProceso();
});
btnEjecutar.addEventListener('click', function () {
    ejecutarProceso();
});
btnEnviarEjecutar.addEventListener('click', function () {
    enviarEjecutarProceso();
});
btnBloquear.addEventListener('click', function () {
    bloquearProceso();
});
btnReanudar.addEventListener('click', function () {
    // reanudarProceso();
});
free();
iniciarDiagrama();
