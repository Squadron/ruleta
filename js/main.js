let preguntas = [];
let preguntaActual = null;
let seleccionActual = null;

if (window.RULETA_CONFIG && window.RULETA_CONFIG.fondo) {
    document.body.classList.remove("bg-gray-100"); // Quita el valor por defecto si existe
    document.body.classList.add(window.RULETA_CONFIG.fondo);
}

if (window.RULETA_CONFIG && typeof window.RULETA_CONFIG.mostrarPreguntas === "boolean") {
	const listaPreguntasDiv = document.querySelector('.bg-white.rounded.shadow.p-4.w-full.md\\:w-80');
	if (listaPreguntasDiv) {
		listaPreguntasDiv.style.display = window.RULETA_CONFIG.mostrarPreguntas ? "block" : "none";
	}
}

const ruleta = document.getElementById('ruleta');
const girarBtn = document.getElementById('girar-btn');
const preguntaContainer = document.getElementById('pregunta-container');
const preguntaDiv = document.getElementById('pregunta');
const respuestasDiv = document.getElementById('respuestas');
const resultadoDiv = document.getElementById('vista-resultado');
const listaPreguntas = document.getElementById('lista-preguntas');
const ruletaContainer = document.querySelector('.relative').parentElement; // div.flex.flex-col.items-center

// Colores intercalados para los sectores
const colores = [
  "#ff462d", // warm red
  "#3d3c3c", // dark stone
  "#4cdd84", // spring green
  "#29707a", // spruce
  "#9e9287", // earth
  "#ff462d", // warm red
  "#3d3c3c", // dark stone
  "#4cdd84", // spring green
  "#29707a", // spruce
  "#9e9287"  // earth
];

// Cargar preguntas y dibujar ruleta/lista
fetch('src/preguntas.json')
  .then(res => res.json())
  .then(data => {
    preguntas = data;
    dibujarRuleta();
    llenarListaPreguntas();
    ajustarBoton();
  });

function llenarListaPreguntas() {
  listaPreguntas.innerHTML = '';
  preguntas.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = p.pregunta;
    listaPreguntas.appendChild(li);
  });
}

function getRuletaSize() {
  // Usa el porcentaje de config.js o 0.9 por defecto
  const porcentaje = window.RULETA_CONFIG?.ruletaPorcentaje || 0.9;
  // Calcula el tamaño según el ancho visible (viewport)
  return Math.floor(window.innerWidth * porcentaje);
}

function dibujarRuleta() {
  const n = preguntas.length;
  const ruletaSize = getRuletaSize();
  const radio = ruletaSize / 2;
  const cx = ruletaSize / 2, cy = ruletaSize / 2;
  let svg = '';

  for (let i = 0; i < n; i++) {
    const startAngle = (2 * Math.PI / n) * i - Math.PI / 2;
    const endAngle = (2 * Math.PI / n) * (i + 1) - Math.PI / 2;
    const x1 = cx + radio * Math.cos(startAngle);
    const y1 = cy + radio * Math.sin(startAngle);
    const x2 = cx + radio * Math.cos(endAngle);
    const y2 = cy + radio * Math.sin(endAngle);

    const largeArc = (2 * Math.PI / n) > Math.PI ? 1 : 0;
    svg += `<path d="M${cx},${cy} L${x1},${y1} A${radio},${radio} 0 ${largeArc},1 ${x2},${y2} Z" fill="${colores[i % colores.length]}" />`;

    const angle = (startAngle + endAngle) / 2;
    const numRadius = radio * 0.7;
    const numX = cx + numRadius * Math.cos(angle);
    const numY = cy + numRadius * Math.sin(angle);
    let deg = angle * 180 / Math.PI + 90;

    // Calcula el tamaño de fuente proporcional al radio
    const fontSize = Math.max(radio * 0.17, 18); // mínimo 18px para que siempre sea legible

    svg += `<text x="${numX}" y="${numY}" class="ruleta-num" fill="#222" font-size="${fontSize}" transform="rotate(${deg} ${numX} ${numY})">${i + 1}</text>`;
  }

  ruleta.setAttribute('width', ruletaSize);
  ruleta.setAttribute('height', ruletaSize);
  ruleta.setAttribute('viewBox', `0 0 ${ruletaSize} ${ruletaSize}`);
  ruleta.innerHTML = svg;

  ajustarFlecha(ruletaSize);
}

function ajustarFlecha(ruletaSize) {
  const flecha = document.getElementById('flecha-indicadora');
  const base = Math.max(ruletaSize * 0.04, 16); // base de la flecha
  const altura = Math.max(ruletaSize * 0.08, 32); // altura de la flecha

  flecha.innerHTML = `
    <div style="
      width: 0;
      height: 0;
      border-left: ${base}px solid transparent;
      border-right: ${base}px solid transparent;
      border-bottom: ${altura}px solid #042315;
    "></div>
  `;
}

function ajustarBoton() {
  const porcentaje = window.RULETA_CONFIG?.botonPorcentaje || 0.3;
  const ancho = Math.floor(window.innerWidth * porcentaje);
  girarBtn.style.width = ancho + "px";
  // Tamaño de fuente proporcional al ancho del botón
  girarBtn.style.fontSize = Math.max(ancho * 0.08, 28) + "px";
  girarBtn.style.padding = Math.max(ancho * 0.04, 24) + "px 0";
  // Separación proporcional entre ruleta y botón
  girarBtn.style.marginTop = Math.max(ancho * 0.12, 40) + "px";
}

// Redibuja la ruleta y ajusta el botón al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
  if (preguntas.length > 0) {
    dibujarRuleta();
    ajustarBoton();
  }
});

girarBtn.addEventListener('click', () => {
  if (preguntas.length === 0) return;

  // Elegir pregunta al azar
  seleccionActual = Math.floor(Math.random() * preguntas.length);

  const n = preguntas.length;
  const gradosPorPregunta = 360 / n;
  const vueltas = Math.floor(Math.random() * 3) + 3; // 3 a 5 vueltas

  // Ahora el centro de la porción seleccionada quedará alineado con la flecha
  const gradosFinal = 360 * vueltas + (n - seleccionActual) * gradosPorPregunta - gradosPorPregunta / 2;

  ruleta.style.transition = 'transform 2s cubic-bezier(0.33, 1, 0.68, 1)';
  ruleta.style.transform = `rotate(${gradosFinal}deg)`;

  girarBtn.disabled = true;

  setTimeout(() => {
    mostrarPregunta(seleccionActual);
  }, 2000);
});

function mostrarPregunta(idx) {
  mostrarVistaPregunta();
  // Padding lateral dinámico (10% del ancho)
  const vistaPregunta = document.getElementById('vista-pregunta');
  const padding = Math.floor(window.innerWidth * 0.10); // 10% de cada lado
  vistaPregunta.style.paddingLeft = padding + "px";
  vistaPregunta.style.paddingRight = padding + "px";

  preguntaActual = preguntas[idx];
  resultadoDiv.classList.add('hidden');
  preguntaDiv.textContent = preguntaActual.pregunta;
  respuestasDiv.innerHTML = '';

  // Ajusta el tamaño de fuente de la pregunta según el ancho de pantalla
  const fontSize = Math.max(window.innerWidth * 0.07, 64); // 7% del ancho, mínimo 64px
  preguntaDiv.style.color = "#fff";
  preguntaDiv.style.fontSize = fontSize + "px";
  preguntaDiv.style.textShadow = "2px 2px 8px #000"; // Opcional: sombra para mejor contraste

  preguntaActual.respuestas.forEach((resp, i) => {
    const btn = document.createElement('button');
    btn.textContent = resp;
    // Opciones: texto negro, fondo blanco, borde redondeado, fuente grande y padding generoso
    btn.className = 'w-full text-black bg-white rounded-3xl border-4 border-gray-300 text-6xl px-12 py-12 my-8 font-bold text-center shadow-xl hover:bg-blue-100 transition';
    btn.onclick = () => validarRespuesta(i);
    respuestasDiv.appendChild(btn);
  });

  ruletaContainer.classList.add('opacity-30', 'pointer-events-none');
}

function validarRespuesta(idx) {
  const esCorrecta = idx === preguntaActual.correcta;
  mostrarVistaResultado(esCorrecta);

  // Muestra el mensaje en la vista 3
  if (esCorrecta) {
    resultadoDiv.textContent = '¡Correcto! 🎉';
    resultadoDiv.className = 'mt-6 text-center text-6xl font-bold text-green-600';
  } else {
    resultadoDiv.textContent = 'Incorrecto 😢';
    resultadoDiv.className = 'mt-6 text-center text-6xl font-bold text-red-600';
  }

  // Espera 2 segundos antes de volver a la ruleta
  setTimeout(() => {
    resultadoDiv.textContent = '';
    ruleta.style.transition = '';
    ruleta.style.transform = '';
    ruletaContainer.classList.remove('opacity-30', 'pointer-events-none');
    girarBtn.disabled = false;
    mostrarVistaRuleta();
  }, 2000);
}

function mostrarVistaRuleta() {
  document.getElementById('vista-ruleta').classList.remove('hidden');
  document.getElementById('vista-pregunta').classList.add('hidden');
  document.getElementById('vista-resultado').classList.add('hidden');
  document.body.className = "min-h-screen flex flex-col items-center justify-center bg-repeat-x bg-top bg-[url('/img/FONDO_RULETA_KYNDRYL_01.jpg')]";
  document.body.style.backgroundColor = "";
  document.body.style.backgroundImage = "";
  document.getElementById('img-resultado').style.display = "none";
}

function mostrarVistaPregunta() {
  document.getElementById('vista-ruleta').classList.add('hidden');
  document.getElementById('vista-pregunta').classList.remove('hidden');
  document.getElementById('vista-resultado').classList.add('hidden');
  document.body.className = "min-h-screen flex flex-col items-center justify-center bg-repeat-x bg-top bg-[url('/img/FONDO_RULETA_KYNDRYL_02.jpg')]";
  document.body.style.backgroundColor = "";
  document.body.style.backgroundImage = "";
  document.getElementById('img-resultado').style.display = "none";
}

function mostrarVistaResultado(correcta) {
  document.getElementById('vista-ruleta').classList.add('hidden');
  document.getElementById('vista-pregunta').classList.add('hidden');
  const vistaResultado = document.getElementById('vista-resultado');
  vistaResultado.classList.remove('hidden');

  // Selecciona la imagen y el color de fondo según el resultado
  const img = document.getElementById('img-resultado');
  if (correcta) {
    img.src = "img/FONDO_RULETA_KYNDRYL_04_B.jpg";
    document.body.style.backgroundColor = "#ffffff";
  } else {
    img.src = "img/FONDO_RULETA_KYNDRYL_03_B.jpg";
    document.body.style.backgroundColor = "#3B393A";
  }
  img.style.display = "block";
  img.style.margin = "auto";

  // Quita cualquier fondo de imagen anterior
  document.body.className = "min-h-screen flex flex-col items-center justify-center";
  document.body.style.backgroundImage = "none";
}