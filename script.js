// Variables globales
let resizeTimeout = null;
let vehiculoTimeouts = [];

// Estado global de la aplicación
const state = {
    currentInterface: 'dope',
    hustlerIndex: 0,
    vehiculoIndex: 0,
    ryoBaseIndex: 0,
    starsIndex: 0,
    heartCount: 100
};

// Configuración global
const CONFIG = {
    imagePath: {
        dope: './assets/dope/',
        ryo: './assets/ryo/'
    },
    interfaces: {
        dope: {
            title: 'DOPE\nFACE\nCREATOR',
            watchBase: './assets/dope/watch_base.png',
            fileName: 'dope-face.png'
        },
        ryo: {
            title: 'DOPEWARS\nFACE\nCREATOR',
            watchBase: './assets/ryo/watch_base_green.png',
            fileName: 'ryo-face.png'
        }
    }
};

// Arrays para almacenar las imágenes disponibles
let hustlers = [];
let vehiculos = [];
let ryoBaseImages = [];
let starsImages = [];

// Referencias a elementos del DOM
let elements = {};

function initializeElements() {
    elements = {
        watchBase: document.querySelector('.watch-base'),
        hustler: document.getElementById('hustler'),
        vehiculo: document.getElementById('vehiculo'),
        clock: document.getElementById('clock'),
        dopeControls: document.getElementById('dope-controls'),
        ryoControls: document.getElementById('ryo-controls'),
        title: document.getElementById('interface-title'),
        stars: document.getElementById('stars'),
        moneyCounter: document.getElementById('money-counter'),
        heartCounter: document.getElementById('heart-counter')
    };
}




// Función para precargar imágenes
async function precargarImagen(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Error cargando imagen: ${src}`));
        img.src = src;
    });
}

// Función para detectar imágenes disponibles
async function detectarImagenesDisponibles(tipo, prefijo) {
    const imagenes = [];
    let index = 1;
    const maxIntentos = 20;
    
    console.log(`Buscando imágenes de tipo ${tipo} con prefijo ${prefijo}`);
    
    for (let i = 1; i <= maxIntentos; i++) {
        const nombreArchivo = `${prefijo}${i}.png`;
        const ruta = `${CONFIG.imagePath[tipo === 'hustler' || tipo === 'vehiculo' ? 'dope' : 'ryo']}${nombreArchivo}`;
        
        try {
            const response = await fetch(ruta);
            if (response.ok) {
                console.log(`Imagen encontrada: ${ruta}`);
                imagenes.push(nombreArchivo);
            } else {
                console.log(`No se encontró: ${ruta}`);
                break;
            }
        } catch (error) {
            console.log(`Error cargando: ${ruta}`, error);
            break;
        }
    }
    
    return imagenes;
}

// Función para actualizar el reloj
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (elements.clock) {
        elements.clock.textContent = `${hours}:${minutes}`;
    }
}

// Función para cambiar el Hustler
function cambiarHustler(direccion) {
    if (hustlers.length === 0) return;
    
    state.hustlerIndex = (state.hustlerIndex + direccion + hustlers.length) % hustlers.length;
    
    const hustler = elements.hustler;
    if (hustler) {
        hustler.classList.add('changing');
        setTimeout(() => {
            hustler.src = CONFIG.imagePath.dope + hustlers[state.hustlerIndex];
            setTimeout(() => {
                hustler.classList.remove('changing');
            }, 150);
        }, 150);
    }
}

// Función para cambiar el Vehículo
function cambiarVehiculo(direccion) {
    // Evitar múltiples clics mientras la animación está en curso
    if (elements.vehiculo.classList.contains('sliding-out-right') || 
        elements.vehiculo.classList.contains('sliding-out-left') || 
        elements.vehiculo.classList.contains('sliding-in-right') || 
        elements.vehiculo.classList.contains('sliding-in-left')) {
        return;
    }
    
    // Limpiar timeouts anteriores
    vehiculoTimeouts.forEach(timeout => clearTimeout(timeout));
    vehiculoTimeouts = [];
    
    const nuevoVehiculo = elements.vehiculo.cloneNode(true);
    state.vehiculoIndex = (state.vehiculoIndex + direccion + vehiculos.length) % vehiculos.length;
    nuevoVehiculo.src = CONFIG.imagePath.dope + vehiculos[state.vehiculoIndex];
    
    // Invertimos la lógica de la dirección aquí
    if (direccion > 0) {
        elements.vehiculo.classList.add('sliding-out-right');
        nuevoVehiculo.classList.add('sliding-in-left');
    } else {
        elements.vehiculo.classList.add('sliding-out-left');
        nuevoVehiculo.classList.add('sliding-in-right');
    }
    
    elements.vehiculo.parentNode.appendChild(nuevoVehiculo);
    
    // Limpiar las clases y elementos después de la animación
    const cleanupTimeout = setTimeout(() => {
        elements.vehiculo.remove();
        nuevoVehiculo.classList.remove('sliding-in-left', 'sliding-in-right');
        elements.vehiculo = nuevoVehiculo;
    }, 400);
    
    vehiculoTimeouts.push(cleanupTimeout);
}





// Función principal para calcular y actualizar dimensiones
function updateDimensions() {
    const windowWidth = window.innerWidth;
    const container = document.querySelector('.center-container');
    const watchWrapper = document.querySelector('.watch-wrapper');
    
    // Calcular dimensiones base
    let containerWidth = 678;
    let scale = 1;
    
    if (windowWidth <= 1200) {
        containerWidth = Math.min(500, windowWidth - 40);
        scale = containerWidth / 678;
    }
    
    if (windowWidth <= 576) {
        containerWidth = windowWidth - 20;
        scale = containerWidth / 678;
    }
    
    // Actualizar contenedor principal
    if (container) {
        container.style.width = `${containerWidth}px`;
        container.style.transform = `scale(${scale})`;
    }
    
    // Actualizar tamaño del reloj
    if (elements.clock) {
        const fontSize = Math.min(160 * scale, 160);
        elements.clock.style.fontSize = `${fontSize}px`;
    }
    
    // Actualizar título según el tamaño de pantalla
    if (elements.title) {
        if (windowWidth <= 992) {
            elements.title.style.whiteSpace = 'nowrap';
            elements.title.innerText = state.currentInterface === 'dope' ? 
                'DOPE FACE CREATOR' : 
                'DOPEWARS FACE CREATOR';
        } else {
            elements.title.style.whiteSpace = 'normal';
            elements.title.innerHTML = CONFIG.interfaces[state.currentInterface].title.replace(/\n/g, '<br>');
        }
    }
    
    return scale;
}

// Función para cambiar interfaz
function cambiarInterfaz(tipo) {
    // Limpiar timeouts pendientes
    vehiculoTimeouts.forEach(timeout => clearTimeout(timeout));
    vehiculoTimeouts = [];
    
    // Actualizar dots
    document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
    document.querySelector(`.dot:nth-child(${tipo === 'dope' ? '1' : '2'}`).classList.add('active');
    
    const isSmallScreen = window.innerWidth <= 992;
    
    if (tipo === 'dope') {
        document.body.setAttribute('data-interface', 'dope');
        document.body.style.backgroundColor = '#101010';
        
        // Actualizar título y watch base
        if (elements.title) {
            elements.title.style.fontFamily = 'Dope-Regular';
            elements.title.style.color = '#FFFFFF';
            elements.title.innerHTML = isSmallScreen ? 'DOPE FACE CREATOR' : CONFIG.interfaces[tipo].title.replace(/\n/g, '<br>');
        }
        
        // Mostrar/ocultar elementos
        if (elements.dopeControls) elements.dopeControls.style.display = 'flex';
        if (elements.ryoControls) elements.ryoControls.style.display = 'none';
        if (elements.stars) elements.stars.style.display = 'none';
        if (elements.moneyCounter) elements.moneyCounter.style.display = 'none';
        if (elements.heartCounter) elements.heartCounter.style.display = 'none';
        if (elements.vehiculo) {
            elements.vehiculo.style.display = 'block';
            elements.vehiculo.classList.remove('sliding-out-left', 'sliding-out-right', 'sliding-in-left', 'sliding-in-right');
        }
        if (elements.hustler) {
            elements.hustler.style.display = 'block';
            elements.hustler.classList.remove('changing');
        }
        
        // Actualizar watch base e imagen base
        if (elements.watchBase) {
            elements.watchBase.src = CONFIG.interfaces.dope.watchBase;
        }
        const imagenBase = document.querySelector('.imagen-base');
        if (imagenBase) {
            imagenBase.src = 'assets/dope/imagen-base.png';
        }
        
    } else {
        document.body.setAttribute('data-interface', 'ryo');
        document.body.style.backgroundColor = '#192118';
        
        // Actualizar título
        if (elements.title) {
            elements.title.style.fontFamily = 'PPMondwest';
            elements.title.style.color = '#2AF780';
            elements.title.innerHTML = isSmallScreen ? 'DOPEWARS FACE CREATOR' : CONFIG.interfaces[tipo].title.replace(/\n/g, '<br>');
        }
        
        // Mostrar/ocultar elementos
        if (elements.dopeControls) elements.dopeControls.style.display = 'none';
        if (elements.ryoControls) elements.ryoControls.style.display = 'flex';
        if (elements.stars) elements.stars.style.display = 'block';
        if (elements.moneyCounter) elements.moneyCounter.style.display = 'block';
        if (elements.heartCounter) elements.heartCounter.style.display = 'block';
        if (elements.vehiculo) elements.vehiculo.style.display = 'none';
        if (elements.hustler) elements.hustler.style.display = 'none';
        
        // Actualizar watch base y elementos RYO
        if (elements.watchBase) {
            elements.watchBase.src = CONFIG.interfaces.ryo.watchBase;
        }
        
        // Establecer imágenes iniciales de RYO si no están establecidas
        const imagenBase = document.querySelector('.imagen-base');
        if (imagenBase && ryoBaseImages.length > 0) {
            imagenBase.src = CONFIG.imagePath.ryo + ryoBaseImages[state.ryoBaseIndex];
        }
        
        if (elements.stars && starsImages.length > 0) {
            elements.stars.src = CONFIG.imagePath.ryo + starsImages[state.starsIndex];
        }
    }
    
    state.currentInterface = tipo;
    updateDimensions();
}


// Agregar las funciones para RYO
function cambiarBaseRyo(direccion) {
    if (ryoBaseImages.length === 0) return;
    
    state.ryoBaseIndex = (state.ryoBaseIndex + direccion + ryoBaseImages.length) % ryoBaseImages.length;
    
    const imagenBase = document.querySelector('.imagen-base');
    if (imagenBase) {
        imagenBase.classList.add('changing');
        imagenBase.src = CONFIG.imagePath.ryo + ryoBaseImages[state.ryoBaseIndex];
        setTimeout(() => imagenBase.classList.remove('changing'), 300);
    }
}

function cambiarStars(direccion) {
    const starsElement = document.getElementById('stars');
    let currentStars = parseInt(starsElement.src.match(/stars_(\d+)/)[1]);
    
    // Calcular nueva cantidad de estrellas
    let newStars = currentStars + direccion;
    
    // Limitar entre 1 y el máximo de estrellas disponibles
    newStars = Math.max(1, Math.min(5, newStars)); // Asumiendo que hay 5 niveles de estrellas
    
    // Actualizar imagen
    starsElement.src = `assets/ryo/stars_${newStars}.png`;
}

// Event listeners
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const scale = updateDimensions();
        
        // Actualizar título según el tamaño de pantalla
        if (elements.title && window.innerWidth <= 992) {
            elements.title.style.whiteSpace = 'nowrap';
            elements.title.innerText = state.currentInterface === 'dope' ? 
                'DOPE FACE CREATOR' : 
                'DOPEWARS FACE CREATOR';
        }
    }, 250);
});

// Agregar event listeners para las teclas de flecha
document.addEventListener('keydown', (e) => {
    if (state.currentInterface === 'dope') {
        if (e.shiftKey) {
            // Con Shift presionado, cambiar vehículo
            switch(e.key) {
                case 'ArrowLeft':
                    cambiarVehiculo(-1);
                    break;
                case 'ArrowRight':
                    cambiarVehiculo(1);
                    break;
            }
        } else {
            // Sin Shift, cambiar hustler
            switch(e.key) {
                case 'ArrowLeft':
                    cambiarHustler(-1);
                    break;
                case 'ArrowRight':
                    cambiarHustler(1);
                    break;
            }
        }
    } else {
        // Controles para RYO
        switch(e.key) {
            case 'ArrowLeft':
                cambiarBaseRyo(-1);
                break;
            case 'ArrowRight':
                cambiarBaseRyo(1);
                break;
            case 'ArrowUp':
                cambiarStars(1);
                break;
            case 'ArrowDown':
                cambiarStars(-1);
                break;
        }
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando aplicación...');
    
    // Inicializar referencias a elementos
    initializeElements();
    
    try {
        // Establecer imagen base inicial
        if (elements.watchBase) {
            elements.watchBase.src = CONFIG.interfaces.dope.watchBase;
        }
        
        // Detectar imágenes disponibles
        console.log('Detectando imágenes disponibles...');
        hustlers = await detectarImagenesDisponibles('hustler', 'hustler');
        vehiculos = await detectarImagenesDisponibles('vehiculo', 'vehiculo');
        ryoBaseImages = await detectarImagenesDisponibles('ryo', 'img_base_');
        starsImages = await detectarImagenesDisponibles('ryo', 'stars_');
        
        console.log('Imágenes detectadas:', {
            hustlers,
            vehiculos,
            ryoBaseImages,
            starsImages
        });
        
        // Establecer imágenes iniciales
        if (hustlers.length > 0 && elements.hustler) {
            elements.hustler.src = CONFIG.imagePath.dope + hustlers[0];
        }
        
        if (vehiculos.length > 0 && elements.vehiculo) {
            elements.vehiculo.src = CONFIG.imagePath.dope + vehiculos[0];
        }
        
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
    
    // Inicializar dimensiones y reloj
    updateDimensions();
    updateClock();
    setInterval(updateClock, 60000);
});

