import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

function animate() {
    requestAnimationFrame(animate);
	renderer.render( scene, camera );
}import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(5, 5, 8);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// OrbitControls - BIKIN BISA MUTER-MUTER
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Axes Helper (garis merah=X, hijau=Y, biru=Z)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// FBX Loader
const loader = new FBXLoader();
loader.load(
    '../../model/wood/wood.fbx',
    (object) => {
        object.scale.set(0.01, 0.01, 0.01);
        
        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(object);
        
        // Center camera ke object
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        
        addDimensionLabels();
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error:', error);
    }
);

// Function buat garis dimensi
function createDimensionLine(start, end, label, offset) {
    const group = new THREE.Group();
    
    // Garis putih
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.Line(geometry, material);
    group.add(line);
    
    // Titik putih di ujung
    const markerGeo = new THREE.SphereGeometry(0.03);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const startMarker = new THREE.Mesh(markerGeo, markerMat);
    startMarker.position.copy(start);
    group.add(startMarker);
    
    const endMarker = new THREE.Mesh(markerGeo, markerMat);
    endMarker.position.copy(end);
    group.add(endMarker);
    
    // Label text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 64, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    sprite.position.copy(midPoint).add(offset);
    sprite.scale.set(0.8, 0.4, 1);
    
    group.add(sprite);
    return group;
}

// Tambah semua label dimensi
function addDimensionLabels() {
    const dims = [
        { start: [-1, 0, 1], end: [2, 0, 1], label: '3m', offset: [0, 0.3, 0] },
        { start: [-1, 0, -0.5], end: [1, 0, -0.5], label: '2m', offset: [0, 0.3, 0] },
        { start: [-1, 0, -1], end: [-0.5, 0, -1], label: '0.5m', offset: [0, 0.3, 0] },
        { start: [0.5, 0, -1], end: [1.04, 0, -1], label: '0.54m', offset: [0, 0.3, 0] },
        { start: [2.1, 0, 0.5], end: [2.1, 0, 1], label: '0.5m', offset: [0.3, 0, 0] },
        { start: [-1.1, 0, -1], end: [-1.1, 0, -0.5], label: '0.5m', offset: [-0.3, 0, 0] },
        { start: [2, 0, 1.1], end: [2, 0.2, 1.1], label: '0.2m', offset: [0.3, 0, 0] },
        { start: [-1, 0, -1.1], end: [-1, 0.2, -1.1], label: '0.2m', offset: [-0.3, 0, 0] },
        { start: [2, 0.2, 0.5], end: [2, 0.4, 0.5], label: '0.2m', offset: [0.3, 0, 0] },
        { start: [0.5, 0.2, -0.5], end: [0.9, 0.2, -0.5], label: '0.4m', offset: [0, 0.3, 0] },
        { start: [0.9, 0, -0.5], end: [0.92, 0.2, -0.5], label: '0.02m', offset: [0.3, 0.1, 0] },
    ];
    
    dims.forEach(d => {
        const line = createDimensionLine(
            new THREE.Vector3(...d.start),
            new THREE.Vector3(...d.end),
            d.label,
            new THREE.Vector3(...d.offset)
        );
        scene.add(line);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // WAJIB untuk smooth rotation
    renderer.render(scene, camera);
}

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();