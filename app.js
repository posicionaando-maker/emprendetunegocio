// Estado global
let pasos = [];
let racha = 0;
let diarioEntries = [];
let temporizadorActivo = false;
let tiempoRestante = libroActual.duracionTemporizador;
let intervalo = null;

// Inicializar datos desde localStorage
function cargarDatos() {
  const guardado = localStorage.getItem('menteEnMarcha');
  if (guardado) {
    const data = JSON.parse(guardado);
    pasos = data.pasos || libroActual.pasos.map(p => ({ texto: p, hecho: false }));
    racha = data.racha || 0;
    diarioEntries = data.diarioEntries || [];
  } else {
    pasos = libroActual.pasos.map(p => ({ texto: p, hecho: false }));
    racha = 0;
    diarioEntries = [];
  }
  actualizarRachaLocalStorage();
}

function guardarDatos() {
  const data = {
    pasos: pasos,
    racha: racha,
    diarioEntries: diarioEntries
  };
  localStorage.setItem('menteEnMarcha', JSON.stringify(data));
}

function actualizarRachaLocalStorage() {
  guardarDatos();
}

// Navegación
let pantallaActual = 'inicio';

function mostrarPantalla(pantalla) {
  pantallaActual = pantalla;
  const contenido = document.getElementById('contenido');
  const btns = document.querySelectorAll('.nav-btn');
  btns.forEach(btn => btn.classList.remove('activo'));
  
  if (pantalla === 'inicio') {
    document.getElementById('btnInicio').classList.add('activo');
    contenido.innerHTML = renderInicio();
  } else if (pantalla === 'libro') {
    document.getElementById('btnLibro').classList.add('activo');
    contenido.innerHTML = renderLibro();
    agregarEventosCheckbox();
  } else if (pantalla === 'timer') {
    document.getElementById('btnTimer').classList.add('activo');
    contenido.innerHTML = renderTimer();
    agregarEventosTimer();
  } else if (pantalla === 'diario') {
    document.getElementById('btnDiario').classList.add('activo');
    contenido.innerHTML = renderDiario();
    agregarEventosDiario();
  } else if (pantalla === 'progreso') {
    document.getElementById('btnProgreso').classList.add('activo');
    contenido.innerHTML = renderProgreso();
  }
}

// Renderizar pantalla de inicio
function renderInicio() {
  const completados = pasos.filter(p => p.hecho).length;
  const porcentaje = Math.round((completados / pasos.length) * 100);
  return `
    <div class="card">
      <h2>📘 ${libroActual.titulo}</h2>
      <p>Autor: ${libroActual.autor}</p>
      <div class="barra-progreso">
        <div class="barra-lleno" style="width: ${porcentaje}%">${porcentaje}%</div>
      </div>
      <p>✅ ${completados} de ${pasos.length} pasos</p>
      <p>🔥 Racha de acción: ${racha} días</p>
      <button id="btnContinuar" class="boton-grande">Continuar mi lectura-acción</button>
    </div>
    <div class="card">
      <p>💡 <em>"${libroActual.fraseMotivacional}"</em></p>
    </div>
  `;
}

// Renderizar checklist del libro
function renderLibro() {
  let html = `<h2>✅ Mis ${pasos.length} pasos</h2>`;
  pasos.forEach((paso, idx) => {
    html += `
      <div class="paso-item">
        <input type="checkbox" class="paso-check" data-idx="${idx}" ${paso.hecho ? 'checked' : ''}>
        <span class="paso-texto ${paso.hecho ? 'completado' : ''}">${paso.texto}</span>
      </div>
    `;
  });
  return html;
}

function agregarEventosCheckbox() {
  document.querySelectorAll('.paso-check').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const idx = e.target.dataset.idx;
      pasos[idx].hecho = e.target.checked;
      guardarDatos();
      mostrarPantalla('libro'); // refrescar
    });
  });
}

// Temporizador
function renderTimer() {
  const horas = Math.floor(tiempoRestante / 3600);
  const minutos = Math.floor((tiempoRestante % 3600) / 60);
  const segundos = tiempoRestante % 60;
  return `
    <h2>⏱️ Jornada de ventas (2h)</h2>
    <div class="timer">
      <div class="timer-numero">${horas.toString().padStart(2,'0')}:${minutos.toString().padStart(2,'0')}:${segundos.toString().padStart(2,'0')}</div>
    </div>
    <button id="btnIniciarTimer" class="boton-grande">▶ Iniciar jornada</button>
    <button id="btnResetTimer" class="boton-grande" style="background:#6B7280">⟳ Reiniciar</button>
    <p class="racha">🔥 Racha actual: ${racha} días seguidos</p>
  `;
}

function agregarEventosTimer() {
  const btnIniciar = document.getElementById('btnIniciarTimer');
  const btnReset = document.getElementById('btnResetTimer');
  
  if (btnIniciar) {
    btnIniciar.onclick = () => {
      if (intervalo) clearInterval(intervalo);
      temporizadorActivo = true;
      intervalo = setInterval(() => {
        if (tiempoRestante > 0) {
          tiempoRestante--;
          mostrarPantalla('timer');
        } else {
          clearInterval(intervalo);
          temporizadorActivo = false;
          alert('✅ ¡Jornada completada! +1 día de racha');
          racha++;
          guardarDatos();
          tiempoRestante = libroActual.duracionTemporizador;
          mostrarPantalla('timer');
        }
      }, 1000);
    };
  }
  
  if (btnReset) {
    btnReset.onclick = () => {
      if (intervalo) clearInterval(intervalo);
      temporizadorActivo = false;
      tiempoRestante = libroActual.duracionTemporizador;
      mostrarPantalla('timer');
    };
  }
}

// Diario rotatorio
function renderDiario() {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 domingo a 6 sábado
  const indicePregunta = diaSemana % libroActual.preguntasDiario.length;
  const pregunta = libroActual.preguntasDiario[indicePregunta];
  
  const entryHoy = diarioEntries.find(e => e.fecha === hoy.toDateString());
  const textoGuardado = entryHoy ? entryHoy.texto : '';
  
  return `
    <h2>📝 Diario del emprendedor</h2>
    <div class="pregunta-diario">📌 ${pregunta}</div>
    <textarea id="textoDiario" placeholder="Escribe tu reflexión...">${textoGuardado}</textarea>
    <button id="btnGuardarDiario" class="boton-grande">💾 Guardar reflexión</button>
    <details>
      <summary>📜 Reflexiones anteriores</summary>
      ${diarioEntries.slice(-5).reverse().map(e => `<div class="card"><small>${e.fecha}</small><p>${e.texto.substring(0,100)}</p></div>`).join('')}
    </details>
  `;
}

function agregarEventosDiario() {
  const btnGuardar = document.getElementById('btnGuardarDiario');
  if (btnGuardar) {
    btnGuardar.onclick = () => {
      const texto = document.getElementById('textoDiario').value;
      if (texto.trim()) {
        const hoy = new Date().toDateString();
        const idx = diarioEntries.findIndex(e => e.fecha === hoy);
        if (idx !== -1) {
          diarioEntries[idx].texto = texto;
        } else {
          diarioEntries.push({ fecha: hoy, texto: texto });
        }
        guardarDatos();
        alert('Reflexión guardada ✅');
        mostrarPantalla('diario');
      } else {
        alert('Escribe algo antes de guardar');
      }
    };
  }
}

// Progreso y exportación
function renderProgreso() {
  const completados = pasos.filter(p => p.hecho).length;
  const porcentaje = Math.round((completados / pasos.length) * 100);
  return `
    <h2>📊 Tu progreso</h2>
    <div class="card">
      <p><strong>Libro:</strong> ${libroActual.titulo}</p>
      <p><strong>Pasos completados:</strong> ${completados}/${pasos.length} (${porcentaje}%)</p>
      <div class="barra-progreso">
        <div class="barra-lleno" style="width: ${porcentaje}%"></div>
      </div>
      <p><strong>Racha de acción:</strong> 🔥 ${racha} días</p>
      <p><strong>Entradas de diario:</strong> ${diarioEntries.length}</p>
      <button id="btnExportarDesdeProgreso" class="boton-grande">📤 Exportar todo mi progreso</button>
    </div>
  `;
}

// Exportar a .txt
function exportarProgreso() {
  const completados = pasos.filter(p => p.hecho).length;
  const porcentaje = Math.round((completados / pasos.length) * 100);
  let contenido = `🧠 MENTE EN MARCHA - EXPORTACIÓN DE PROGRESO\n`;
  contenido += `=====================================\n`;
  contenido += `📘 Libro: ${libroActual.titulo} (${libroActual.autor})\n`;
  contenido += `📅 Fecha: ${new Date().toLocaleString()}\n`;
  contenido += `✅ Pasos completados: ${completados}/${pasos.length} (${porcentaje}%)\n`;
  contenido += `🔥 Racha de acción: ${racha} días\n`;
  contenido += `📝 Entradas de diario: ${diarioEntries.length}\n\n`;
  contenido += `📋 LISTA DE PASOS:\n`;
  pasos.forEach((p, i) => {
    contenido += `${i+1}. ${p.texto} - ${p.hecho ? '✓ COMPLETADO' : '○ PENDIENTE'}\n`;
  });
  contenido += `\n📔 REFLEXIONES DEL DIARIO:\n`;
  diarioEntries.forEach(e => {
    contenido += `[${e.fecha}]\n${e.texto}\n---\n`;
  });
  
  const blob = new Blob([contenido], {type: 'text/plain'});
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `mente-en-marcha-${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// Eventos globales y navegación inicial
document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  
  document.getElementById('btnInicio').onclick = () => mostrarPantalla('inicio');
  document.getElementById('btnLibro').onclick = () => mostrarPantalla('libro');
  document.getElementById('btnTimer').onclick = () => mostrarPantalla('timer');
  document.getElementById('btnDiario').onclick = () => mostrarPantalla('diario');
  document.getElementById('btnProgreso').onclick = () => mostrarPantalla('progreso');
  
  const btnExportar = document.getElementById('btnExportar');
  if (btnExportar) btnExportar.onclick = exportarProgreso;
  
  // Delegado para botón de exportar dentro de progreso
  document.getElementById('contenido').addEventListener('click', (e) => {
    if (e.target.id === 'btnExportarDesdeProgreso') {
      exportarProgreso();
    }
    if (e.target.id === 'btnContinuar') {
      mostrarPantalla('libro');
    }
  });
  
  mostrarPantalla('inicio');
});
