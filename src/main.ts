import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import './style.css'

const scene = new THREE.Scene()
// const gui = new dat.GUI();

const textureLoader = new THREE.TextureLoader();



const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)



// Meshes

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({
    color: 'red'
  }))
box.position.z = -5
scene.add(box)

const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.15, 0.2, 32),
  new THREE.MeshStandardMaterial({
    color: 'white',
    visible: false,

  })
)
reticle.matrixAutoUpdate = false
scene.add(reticle)

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 5, 10)
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true
});
renderer.setSize(sizes.width, sizes.height);
document.body.appendChild(renderer.domElement);
renderer.xr.enabled = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }))


window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.pixelRatio = Math.min(window.devicePixelRatio, 2)
});

const control = new OrbitControls(camera, renderer.domElement);

const clock = new THREE.Clock();

function tick() {
  const elapsedTime = clock.getElapsedTime()
  box.rotation.y += 0.01
  control.update(elapsedTime)
  // earth.position.x += Math.cos()
  // earth.position.z += Math.sin(0.1)
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(tick)