// JavaScript para a animação de scroll das NUVENS MÓDULO (MANTIDO)
document.addEventListener('DOMContentLoaded', () => {
    const moduleClouds = document.querySelectorAll('.module-cloud');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    moduleClouds.forEach(cloud => {
        observer.observe(cloud);
    });
});

// AVIÃO 3D - VERSÃO AVANÇADA COM CONTROLES INDIVIDUAIS
let scene, camera, renderer, airplane;
let airplaneContainer;
let isInitialized = false;
let pathPoints = []; // Array expandido com posição, rotação e escala
let scrollTl;
let airplaneMaterials = [];
let baseRotation = { x: 0, y: 0, z: 0 }; // Rotação base do modelo

// Configurações do avião
const airplaneConfig = {
    modelPath: 'scene.gltf',
    initialScale: 0.35
};

// Inicializar Three.js
function initThreeJS() {
    airplaneContainer = document.getElementById('airplane-container');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    if (airplaneContainer) {
        airplaneContainer.appendChild(renderer.domElement);
    } else {
        console.error("Airplane container not found!");
        return;
    }

    setupLighting();
    loadAirplaneModel(airplaneConfig.modelPath);
    animate();
    isInitialized = true;
}

// Carregar modelo GLTF
function loadAirplaneModel(modelPath) {
    const loadingManager = new THREE.LoadingManager();
    
    loadingManager.onLoad = function() {
        console.log('Loading complete!');
        setupScrollAnimations();
    };

    const loader = new THREE.GLTFLoader(loadingManager);

    loader.load(modelPath, (gltf) => {
        airplane = gltf.scene;
        scene.add(airplane);

        airplane.scale.set(airplaneConfig.initialScale, airplaneConfig.initialScale, airplaneConfig.initialScale);
        
        // ✅ CORREÇÃO: Definir rotação base inicial (não será sobrescrita)
        baseRotation = {
            x: -Math.PI * 0.1,  // Inclinar para mostrar piloto. RANGE: -π a π (-180° a 180°)
            y: 0,               // Direção lateral. RANGE: -π a π (-180° a 180°) 
            z: 0                // Rolagem (barrel roll). RANGE: -π a π (-180° a 180°)
        };

        airplaneMaterials = [];
        airplane.traverse((o) => {
            if (o.isMesh && o.material) {
                o.material = o.material.clone();
                o.material.transparent = true;
                o.material.opacity = 1; // Opacidade inicial (1 = visível, 0 = invisível)
                airplaneMaterials.push(o.material);
            }
        });

        console.log("GLTF model loaded successfully");
    }, undefined, (error) => {
        console.error('Error loading GLTF:', error);
    });
}

// Conversão de coordenadas relativas para 3D
function get3DPosition(relativePos) {
    const x = (relativePos.x - 0.5) * 4; // RANGE: -2 a 2 (mundo 3D)
    const y = (0.5 - relativePos.y) * 3; // RANGE: -1.5 a 1.5 (mundo 3D)
    return { x, y, z: 0 };
}

// ✅ NOVA FUNCIONALIDADE: Configurar animações com controles avançados
function setupScrollAnimations() {
    if (!isInitialized || !airplane) return;

    // ✅ PATHPOINTS INVERTIDOS: Trajetória ascendente natural para scroll-up
        pathPoints = [



        {
            // ✅ PathPoint fim - SAÍDA final: Subida íngreme à direita, piloto fora da tela
            x: 0.6, y: -2.5,           // Direita extrema, topo alto (fora da tela)
            rotX: Math.PI * 0.9,        // Nariz MUITO para cima (subida íngreme de 72°)
            rotY: -Math.PI * 1.1,       // Meio de costas/lado (piloto visível, -108°)
            rotZ: -Math.PI * 0.2,       // Rolagem à direita para manobra de saída (-36°)
            scale: 1.3,                // Muito pequeno (efeito distância extrema)
            lightIntensity: 5.0,         // Fade final
            opacity: 0,
        },

        {
            // ✅ PathPoint 00 - SAÍDA inicio: Subida íngreme à direita, piloto visível
            x: 0.6, y: 0.2,           // Direita extrema, topo alto (fora da tela)
            rotX: Math.PI * 0.6,        // Nariz MUITO para cima (subida íngreme de 72°)
            rotY: -Math.PI * 1.1,       // Meio de costas/lado (piloto visível, -108°)
            rotZ: -Math.PI * 0.2,       // Rolagem à direita para manobra de saída (-36°)
            scale: 0.65,                // Muito pequeno (efeito distância extrema)
            lightIntensity: 4.0         // Fade final
        },

        {
            // ☁️ PathPoint 01 - Esquerda. Metade baixo
            x: -1, y: 0.8,             // Esquerda. Metade baixo
            rotX: Math.PI * 0.15,      // Nariz inclinado para cima.
            rotY: Math.PI * -1.0,       // Curva para direita
            rotZ: Math.PI * 0.3,       // Rolagem (centro do avião) acentuada a direita; direita da tela
            scale: 0.55,               // Tamanho médio-grande
            lightIntensity: 2.0        // Iluminação
        },

        {
            // ☁️ PathPoint 02 - Esquerda. Metade baixo
            x: 0.4, y: 1,             // Esquerda. Metade baixo
            rotX: Math.PI * 0.15,      // Nariz inclinado para cima.
            rotY: Math.PI * -0.5,       // Curva para direita
            rotZ: Math.PI * 0.1,       // Rolagem (centro do avião) acentuada a direita; direita da tela
            scale: 0.55,               // Tamanho médio-grande
            lightIntensity: 1.2        // Iluminação
        },

        { 
            // ☁️ PathPoint 03 - Subindo. Direita. Nuvem 5. Fazendo curva para a esquerda
            x: 1, y: 1,                // Direita. Metade baixo
            rotX: Math.PI * 0.2,       // Nariz levemente para cima. Subida moderada
            rotY: -Math.PI * 0.8,      // Curvando forte para esquerda
            rotZ: Math.PI * -0.5,      // Rolagem forte para esquerda
            scale: 0.55,               // Tamanho médio
            lightIntensity: 0.55          // Iluminação padrão
        },
        

        // ☁️ PathPoint 04 - Direita. Metade baixo. Entre nuvem 4 e 5
        { 
            x: 1.2, y: 1, 
            rotX: -Math.PI * 0.15,     // Descida moderada
            rotY: -Math.PI * 1.2,      // Curva para direita
            rotZ: Math.PI * 0,         // Rolagem direita
            scale: 0.40,               // Tamanho médio
            lightIntensity: 0.9        // Iluminação padrão
        },
        
        { 
            // ☁️ PathPoint 05 - Esquerda. Nuvem 4. Metade cima.
            x: -0.2, y: 0.35,          // Esquerda. Metade cima
            rotX: Math.PI * 0.2,       // Nariz suavem subida
            rotY: -Math.PI * 1.0,      // De costas para tela, frente para nuvem
            rotZ: Math.PI * 0.03,      // Rolagem à esquerda, manobra inicial (32°)
            scale: 0.55,               // Tamanho de destaque na primeira nuvem
            lightIntensity: 0.9        // Boa iluminação na primeira parada
        },
        
        { 
            // ☁️ PathPoint 06 - Esquerda. Nuvem 3
            x: -0.2, y: 0.65,           // Esquerda. Metade
            rotX: Math.PI * 0.2,        // Nariz levemente para cima. Subida moderada
            rotY: -Math.PI * 0.8,       // Curvando moderada para direita
            rotZ: Math.PI * 0.2,        // Rolagem dramática direita
            scale: 0.85,                // Tamanho médio-grande
            lightIntensity: 1.5         // Iluminação alta na transição
        },
 
        { 
            // ☁️ PathPoint 07 - Subindo. Direita. Entre nuvem 2 e 3. Fazendo curva para a esquerda
            x: 1, y: 1,                // Direita. Metade baixo
            rotX: Math.PI * 0.2,       // Nariz levemente para cima. Subida moderada
            rotY: -Math.PI * 0.8,      // Curvando forte para esquerda
            rotZ: Math.PI * -0.5,      // Rolagem forte para esquerda
            scale: 0.45,               // Tamanho normal
            lightIntensity: 0.90        // Iluminação padrão
        },
        
        { 
            // ☁️ PathPoint 08 - Direita. Nuvem 2
            x: 1, y: 1,                // Direita. Metade baixo
            rotX: Math.PI * 0.1,       // Nariz forte para cima
            rotY: -Math.PI * 1.2,      // virado de costas. 1.5 com curva forte a direita
            rotZ: Math.PI * 0,         // Rolagem à direita 0
            scale: 0.25,               // Tamanho de destaque na primeira nuvem
            lightIntensity: 0.90       // Boa iluminação na primeira parada
        },

        { 
            // 🎬 PathPoint 09 - ENTRADA (final). Nuvem 1Esquerda. Avião DE COSTAS para tela
            x: -0.2, y: 1,             // Esquerda. Metade baixo
            rotX: Math.PI * 0.15,      // Nariz inclinado para cima.
            rotY: Math.PI * -1.0,      // 180° - Completamente de costas para tela
            rotZ: Math.PI * 0.3,       // Rolagem (centro do avião) acentuada a direita; direita da tela
            scale: 0.65,               // Tamanho médio-grande
            lightIntensity: 1.3        // Iluminação 
        },

        { 
            // 🎬 PathPoint 10 - ENTRADA dramática. Centro. Próximo a tela. Mostrando a parte de baixo faznedo curva acentuada para a esquerda
            x: 0.8, y: 1.3,            // Centro. Metade baixo
            rotX: Math.PI * 0.02,      // Nariz levemente para cima 
            rotY: -Math.PI * 0.15,     // Ainda de frente. Curva acentuada esquerda
            rotZ: Math.PI * 0.25,      // Rolagem (centro do avião) acentuada à direita; esquerda da tela
            scale: 1.1,                // Grande (próximo da tela)
            lightIntensity: 1.8        // Iluminação 
        },               
        
        { 
            // 🎬 PathPoint 11 - INÍCIO rodape. Direita. Frente para o usuário
            x: 1, y: 1,               // Direita. Metade baixo
            rotX: 0,                  // Nariz nivelado com horizonte
            rotY: 0,                  // De frente para a tela (0°)
            rotZ: 0,                  // Sem rolagem (voo reto)
            scale: 0.25,              // Pequeno (ao fundo, efeito distância)
            lightIntensity: 0.5       // Pouca iluminação inicial (discreto)
        }
    ];

    // Define estado inicial
    const initialPos3D = get3DPosition(pathPoints[0]);
    const initialPoint = pathPoints[0];
    
    airplane.position.set(initialPos3D.x, initialPos3D.y, initialPos3D.z);
    airplane.scale.set(initialPoint.scale, initialPoint.scale, initialPoint.scale);

    // Timeline principal
    scrollTl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
            onUpdate: (self) => {
                updateAirplanePosition(self.progress);
            }
        }
    });

    // Fade out apenas no final
    scrollTl.to(airplaneMaterials, { opacity: 1, duration: 0.05, ease: "power1.in" }, 0.85);

    console.log("Airplane ScrollTrigger Animation Setup Complete - ASCENDING FLIGHT PATH");
}

// ✅ FUNÇÃO AVANÇADA: Atualização com todos os controles
function updateAirplanePosition(progress) {
    if (!airplane || pathPoints.length === 0) return;

    const totalSegments = pathPoints.length - 1;
    const currentSegmentIndex = Math.floor(progress * totalSegments);
    const segmentProgress = (progress * totalSegments) - currentSegmentIndex;

    const fromIndex = Math.min(currentSegmentIndex, pathPoints.length - 1);
    const toIndex = Math.min(currentSegmentIndex + 1, pathPoints.length - 1);

    const fromPoint = pathPoints[fromIndex];
    const toPoint = pathPoints[toIndex];

    // ✅ INTERPOLAÇÃO COMPLETA: Posição, rotação e escala
    const currentRelativeX = gsap.utils.interpolate(fromPoint.x, toPoint.x, segmentProgress);
    const currentRelativeY = gsap.utils.interpolate(fromPoint.y, toPoint.y, segmentProgress);
   
  
    // Aplicar posição
    const currentPos3D = get3DPosition({ x: currentRelativeX, y: currentRelativeY });
    airplane.position.set(currentPos3D.x, currentPos3D.y, currentPos3D.z);

    // ✅ INTERPOLAÇÃO DE ROTAÇÕES (radianos)
    const currentRotX = gsap.utils.interpolate(fromPoint.rotX, toPoint.rotX, segmentProgress);
    const currentRotY = gsap.utils.interpolate(fromPoint.rotY, toPoint.rotY, segmentProgress);
    const currentRotZ = gsap.utils.interpolate(fromPoint.rotZ, toPoint.rotZ, segmentProgress);
    
    // Aplicar rotações (somando com a rotação base)
    airplane.rotation.x = baseRotation.x + currentRotX;
    airplane.rotation.y = baseRotation.y + currentRotY; 
    airplane.rotation.z = baseRotation.z + currentRotZ;

    // ✅ INTERPOLAÇÃO DE ESCALA
    const currentScale = gsap.utils.interpolate(fromPoint.scale, toPoint.scale, segmentProgress);
    airplane.scale.set(currentScale, currentScale, currentScale);

    // ✅ CONTROLE DE ILUMINAÇÃO DINÂMICA
    const currentLightIntensity = gsap.utils.interpolate(fromPoint.lightIntensity, toPoint.lightIntensity, segmentProgress);
    updateLighting(currentLightIntensity);
}

// ✅ NOVA FUNÇÃO: Controle dinâmico de iluminação
function updateLighting(intensity) {
    // Atualiza intensidade das luzes existentes
    scene.traverse((object) => {
        if (object.isAmbientLight) {
            object.intensity = intensity * 0.8; // Luz ambiente mais suave
        }
        if (object.isDirectionalLight) {
            object.intensity = intensity; // Luz direcional principal
        }
        if (object.isPointLight) {
            object.intensity = intensity * 0.6; // Luz pontual secundária
        }
    });
}

// Configurar iluminação inicial
function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);
}

// ✅ LOOP DE ANIMAÇÃO CORRIGIDO (sem sobrescrever rotações)
function animate() {
    requestAnimationFrame(animate);

    if (airplane) {
        // ✅ CORREÇÃO: Apenas oscilação suave em Y (sem sobrescrever rotação X)
        const oscillation = Math.sin(Date.now() * 0.003) * 0.001;
        airplane.position.y += oscillation;
        
        // Pequena turbulência apenas em Z (sem interferir com X e Y)
        const turbulence = Math.sin(Date.now() * 0.002) * 0.005;
        airplane.rotation.z += turbulence;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Redimensionar
function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initThreeJS();
    }, 100);
});

window.addEventListener('resize', onWindowResize);

// Animações de entrada (mantidas)
window.addEventListener('load', () => {
    document.body.style.opacity = '1';

    gsap.from('.main-title', {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: "power2.out",
        delay: 0.5
    });

    gsap.from('.subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power2.out",
        delay: 0.8
    });
});