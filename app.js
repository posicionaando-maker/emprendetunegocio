// === ESTADO GLOBAL ===
let pasos = [];
let racha = 0;
let diarioEntries = [];
let temporizadorActivo = false;
let tiempoRestante = libroActual.duracionTemporizador;
let intervalo = null;

// === INICIALIZACIÓN ===
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
  guardarDatos();
}

function guardarDatos() {
  const data = {
    pasos: pasos,
    racha: racha,
    diarioEntries: diarioEntries
  };
  localStorage.setItem('menteEnMarcha', JSON.stringify(data));
}

// === MODO AUDIBLE (texto a voz offline) ===
let audioActivo = false;

function hablar(texto) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      audioActivo = true;
      const estadoDiv = document.getElementById('estadoAudio');
      if (estadoDiv) estadoDiv.innerHTML = '🔊 Reproduciendo...';
    };
    
    utterance.onend = () => {
      audioActivo = false;
      const estadoDiv = document.getElementById('estadoAudio');
      if (estadoDiv) estadoDiv.innerHTML = '✅ Audio completado';
      setTimeout(() => {
        if (estadoDiv && estadoDiv.innerHTML === '✅ Audio completado') {
          estadoDiv.innerHTML = '';
        }
      }, 2000);
    };
    
    utterance.onerror = () => {
      audioActivo = false;
      const estadoDiv = document.getElementById('estadoAudio');
      if (estadoDiv) estadoDiv.innerHTML = '❌ Error. Tu navegador es compatible?';
    };
    
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Tu navegador no soporta audio offline. Prueba con Chrome, Edge o Safari.');
  }
}

function generarTextoIdeasClave() {
  return `Ideas y valores principales del libro ${libroActual.titulo} de ${libroActual.autor}. 
  Primera idea: La claridad es poder. Define exactamente qué negocio quieres y por qué. 
  Segunda idea: La acción vence al miedo. El análisis sin acción es solo procrastinación. 
  Tercera idea: Los números no mienten. Domina flujo de caja, punto de equilibrio y ventas. 
  Cuarta idea: El cliente es el jefe. Valida tu idea antes de invertir tiempo y dinero. 
  Quinta idea: Vende todos los días. La prospección es el motor de cualquier negocio. 
  Sexta idea: Delega para crecer. Haz solo lo que solo tú puedes hacer.`;
}

function generarTextoBeneficios() {
  return `Beneficios que obtendrás al aplicar este libro. 
  Beneficio uno: pasar de la idea a la acción en menos de treinta días. 
  Beneficio dos: evitar los cinco errores más comunes que quiebran emprendedores. 
  Beneficio tres: tener un plan financiero mínimo pero realista. 
  Beneficio cuatro: ganar confianza para vender sin miedo al rechazo. 
  Beneficio cinco: identificar qué tareas delegar para no estancarte. 
  Beneficio seis: medir tu progreso semanal y celebrar pequeñas victorias.`;
}

function detenerAudio() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    audioActivo = false;
    const estadoDiv = document.getElementById('estadoAudio');
    if (estadoDiv) estadoDiv.innerHTML = '⏹️ Audio detenido';
    setTimeout(() => {
      if (estadoDiv && estadoDiv.innerHTML === '⏹️ Audio detenido') {
        estadoDiv.innerHTML = '';
      }
    }, 1500);
  }
}

// === RENDERIZADO DE PANTALLAS ===

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

    <div class="card audible-card">
      <h3>🎧 Modo audible</h3>
      <p>Escucha mientras haces otras actividades:</p>
      <button id="btnAudibleResumen" class="boton-audible">🔊 Escuchar ideas clave</button>
      <button id="btnAudibleBeneficios" class="boton-audible">🎯 Escuchar beneficios</button>
      <button id="btnDetenerAudio" class="boton-audible detener">⏹️ Detener</button>
      <div id="estadoAudio" class="estado-audio"></div>
    </div>

    <div class="card">
      <h3>💡 Ideas y valores principales</h3>
      <ul class="lista-ideas">
        <li>🔑 <strong>La claridad es poder</strong> – Define exactamente qué negocio quieres y por qué</li>
        <li>🎯 <strong>La acción vence al miedo</strong> – El análisis sin acción es solo procrastinación</li>
        <li>📊 <strong>Los números no mienten</strong> – Domina flujo de caja, punto de equilibrio y ventas</li>
        <li>🤝 <strong>El cliente es el jefe</strong> – Valida tu idea antes de invertir tiempo y dinero</li>
        <li>⚡ <strong>Vende todos los días</strong> – La prospección es el motor de cualquier negocio</li>
        <li>🧩 <strong>Delega para crecer</strong> – Haz solo lo que solo tú puedes hacer</li>
      </ul>
    </div>

    <div class="card">
      <h3>🎁 Beneficios que obtendrás</h3>
      <div class="beneficio-item">
        <span>✅</span> <span>Pasar de la idea a la acción en menos de 30 días</span>
      </div>
      <div class="beneficio-item">
        <span>✅</span> <span>Evitar los 5 errores más comunes que quiebran emprendedores</span>
      </div>
      <div class="beneficio-item">
        <span>✅</span> <span>Tener un plan financiero mínimo pero realista</span>
      </div>
      <div class="beneficio-item">
        <span>✅</span> <span>Ganar confianza para vender sin miedo al rechazo</span>
      </div>
      <div class="beneficio-item">
        <span>✅</span> <span>Identificar qué tareas delegar para no estancarte</span>
      </div>
      <div class="beneficio-item">
        <span>✅</span> <span>Medir tu progreso semanal y celebrar pequeñas victorias</span>
      </div>
    </div>

    <div class="card">
      <p>💡 <em>"${libroActual.fraseMotivacional}"</em></p>
    </div>
  `;
}

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

function renderDiario() {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
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

// === NAVEGACIÓN ===
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

function agregarEventosCheckbox() {
  document.querySelectorAll('.paso-check').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const idx = e.target.dataset.idx;
      pasos[idx].hecho = e.target.checked;
      guardarDatos();
      mostrarPantalla('libro');
    });
  });
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

// === EXPORTACIÓN ===
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

// === EVENTOS GLOBALES Y ARRANQUE ===
document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  
  // Navegación principal
  document.getElementById('btnInicio').onclick = () => mostrarPantalla('inicio');
  document.getElementById('btnLibro').onclick = () => mostrarPantalla('libro');
  document.getElementById('btnTimer').onclick = () => mostrarPantalla('timer');
  document.getElementById('btnDiario').onclick = () => mostrarPantalla('diario');
  document.getElementById('btnProgreso').onclick = () => mostrarPantalla('progreso');
  
  // Botón de exportación global (footer)
  const btnExportar = document.getElementById('btnExportar');
  if (btnExportar) btnExportar.onclick = exportarProgreso;
  
  // Delegación de eventos para botones dinámicos
  document.getElementById('contenido').addEventListener('click', (e) => {
    // Botón continuar (inicio)
    if (e.target.id === 'btnContinuar') {
      mostrarPantalla('libro');
    }
    // Botón exportar desde pantalla de progreso
    if (e.target.id === 'btnExportarDesdeProgreso') {
      exportarProgreso();
    }
    // Botones de audible
    if (e.target.id === 'btnAudibleResumen') {
      hablar(generarTextoIdeasClave());
    }
    if (e.target.id === 'btnAudibleBeneficios') {
      hablar(generarTextoBeneficios());
    }
    if (e.target.id === 'btnDetenerAudio') {
      detenerAudio();
    }
  });
  
  // Mostrar inicio al cargar
  mostrarPantalla('inicio');
});
