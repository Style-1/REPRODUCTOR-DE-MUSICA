// ===========================
// ELEMENTOS DEL DOM
// ===========================
const tituloCancion = document.querySelector('.song-info h1');
const nombreArtista = document.querySelector('.song-info p');
const progreso = document.getElementById('progreso');
const cancion = document.getElementById('cancion');
const iconoControl = document.getElementById('iconoControl');
const botonReproducirPausar = document.querySelector('.controles .boton-reproducir-pausar');
const botonAtras = document.querySelector('.controles .atras');
const botonSiguiente = document.querySelector('.controles .siguiente');
const botonAleatorio = document.querySelector('.controles .aleatorio');
const botonRepetir = document.querySelector('.controles .repetir');
const playlistContainer = document.getElementById('playlist-container');
const songCount = document.getElementById('song-count');

// ===========================
// VARIABLES GLOBALES
// ===========================
const canciones = [];
let indiceCancionActual = 0;
let modoAleatorio = false;
let modoRepetir = false;

// ===========================
// FUNCIONES PRINCIPALES
// ===========================

function actualizarInfoCancion() {
    if (canciones.length === 0) {
        tituloCancion.textContent = "Selecciona una canción";
        nombreArtista.textContent = "Artista desconocido";
        return;
    }

    tituloCancion.textContent = canciones[indiceCancionActual].titulo;
    nombreArtista.textContent = canciones[indiceCancionActual].nombre;
    cancion.src = canciones[indiceCancionActual].fuente;
    cancion.loop = modoRepetir;
    actualizarPlaylist();
}

function actualizarPlaylist() {
    playlistContainer.innerHTML = '';
    songCount.textContent = `${canciones.length} canción${canciones.length !== 1 ? 'es' : ''}`;

    if (canciones.length === 0) {
        playlistContainer.innerHTML = `
            <li style="color: var(--text-muted); text-align: center; padding: 40px 20px;">
                <i class="bi bi-music-note" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                Carga archivos de música para comenzar
            </li>
        `;
        return;
    }

    canciones.forEach((cancionItem, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="bi bi-music-note" style="font-size: 1.2rem; color: var(--accent-color);"></i>
                <div>
                    <div style="font-weight: 500; margin-bottom: 2px;">${cancionItem.titulo}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${cancionItem.nombre}</div>
                </div>
            </div>
        `;

        li.onclick = () => {
            indiceCancionActual = index;
            actualizarInfoCancion();
            reproducirCancion();
        }

        if (index === indiceCancionActual) {
            li.classList.add('activo');
        }

        playlistContainer.appendChild(li);
    });
}

function reproducirPausar() {
    if (cancion.paused) {
        reproducirCancion();
    } else {
        pausarCancion();
    }
}

function reproducirCancion() {
    cancion.play();
    iconoControl.classList.add('bi-pause-circle');
    iconoControl.classList.remove('bi-play-circle');
}

function pausarCancion() {
    cancion.pause();
    iconoControl.classList.remove('bi-pause-circle');
    iconoControl.classList.add('bi-play-circle');
}

function obtenerIndiceAleatorio() {
    let nuevoIndice;
    do {
        nuevoIndice = Math.floor(Math.random() * canciones.length);
    } while (nuevoIndice === indiceCancionActual && canciones.length > 1);
    return nuevoIndice;
}

function siguienteCancion() {
    if (canciones.length === 0) return;

    if (modoRepetir) {
        cancion.currentTime = 0;
        reproducirCancion();
        return;
    }

    if (modoAleatorio) {
        indiceCancionActual = obtenerIndiceAleatorio();
    } else {
        indiceCancionActual = (indiceCancionActual + 1) % canciones.length;
    }

    actualizarInfoCancion();
    pausarCancion(); // Pausa para que la barra no avance automáticamente
}

function cancionAnterior() {
    if (canciones.length === 0) return;

    if (modoRepetir) {
        cancion.currentTime = 0;
        reproducirCancion();
        return;
    }

    if (modoAleatorio) {
        indiceCancionActual = obtenerIndiceAleatorio();
    } else {
        indiceCancionActual = (indiceCancionActual - 1 + canciones.length) % canciones.length;
    }

    actualizarInfoCancion();
    pausarCancion(); // Pausa para que la barra no avance automáticamente
}

function toggleModoAleatorio() {
    if (modoAleatorio) {
        modoAleatorio = false;
    } else {
        modoAleatorio = true;
        modoRepetir = false;
        botonRepetir.classList.remove('active');
    }

    botonAleatorio.classList.toggle('active');
    cancion.loop = modoRepetir;
}

function toggleModoRepetir() {
    if (modoRepetir) {
        modoRepetir = false;
    } else {
        modoRepetir = true;
        modoAleatorio = false;
        botonAleatorio.classList.remove('active');
    }

    botonRepetir.classList.toggle('active');
    cancion.loop = modoRepetir;
}

// ===========================
// EVENT LISTENERS - ARCHIVOS
// ===========================

document.getElementById('fondo-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.body.style.backgroundImage = `url(${event.target.result})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('musica-input').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);

    files.forEach(file => {
        const url = URL.createObjectURL(file);
        const nombreArchivo = file.name.replace(/\.[^/.]+$/, "");
        canciones.push({
            titulo: nombreArchivo,
            nombre: 'Música Local',
            fuente: url
        });
    });

    actualizarPlaylist();
    if (canciones.length === files.length) {
        actualizarInfoCancion();
    }
});

// ===========================
// EVENT LISTENERS - AUDIO
// ===========================

cancion.addEventListener('loadedmetadata', function() {
    progreso.max = cancion.duration;
});

cancion.addEventListener('timeupdate', function() {
    if (!cancion.paused) {
        progreso.max = cancion.duration;
        progreso.value = cancion.currentTime;
    }
});

cancion.addEventListener('ended', function() {
    if (modoRepetir) {
        return;
    }

    if (modoAleatorio) {
        indiceCancionActual = obtenerIndiceAleatorio();
    } else {
        indiceCancionActual = (indiceCancionActual + 1) % canciones.length;
    }

    actualizarInfoCancion();
    reproducirCancion();
});

// ===========================
// EVENT LISTENERS - CONTROLES
// ===========================

botonReproducirPausar.addEventListener('click', reproducirPausar);
botonSiguiente.addEventListener('click', siguienteCancion);
botonAtras.addEventListener('click', cancionAnterior);
botonAleatorio.addEventListener('click', toggleModoAleatorio);
botonRepetir.addEventListener('click', toggleModoRepetir);

// ===========================
// EVENT LISTENERS - PROGRESO
// ===========================

progreso.addEventListener('input', function() {
    cancion.currentTime = progreso.value;
});

progreso.addEventListener('change', function() {
    if (canciones.length > 0) {
        reproducirCancion();
    }
});

// ===========================
// INICIALIZACIÓN
// ===========================

actualizarInfoCancion();
