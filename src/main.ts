import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import './style.css'


const scene = new THREE.Scene()
// const gui = new dat.GUI();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)
// const sun = new THREE.DirectionalLight(0xffffff, 2);
// sun.castShadow = true
// scene.add(sun)

// const loader = new GLTFLoader().load('/src/model/rhino_animation_walk/scene.gltf', (gltf) => {
//   const model = gltf.scene
//   model.traverse((node) => {
//     if (node instanceof THREE.Mesh) {
//       console.log(node)
//       node.castShadow = true
//     }
//   })
//   model.scale.set(0.09, 0.09, 0.09)
//   model.position.z = -10
//   // scene.add(model)
// })

// const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial())
// floor.rotation.x = -Math.PI / 2
// floor.receiveShadow = true
// scene.add(floor)

// Hit Test vars
let hitTestSource: any | null = null;
let hitTestSourceREquested: any | null = false;
// Meshes

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1).rotateX(-Math.PI / 2)
const cubeMaterial = new THREE.MeshStandardMaterial({
  color: 'red',
  visible: true

})


const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.15, 0.2, 64),
  new THREE.MeshStandardMaterial({
    color: 'red',
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
renderer.shadowMap.enabled = true;
document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] }))

// get COntroller

let controller = renderer.xr.getController(0)
controller.addEventListener('select', onSelect)
scene.add(controller)

function onSelect() {
  if (reticle.visible) {
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
    cubeMesh.position.setFromMatrixPosition(reticle.matrix);
    cubeMesh.name = 'cube'
    cubeMesh.position.z = -3
    scene.add(cubeMesh)
  }
}

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

function tick(timeStamp: number, frame?: XRFrame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace()
    console.log(referenceSpace)
    const session = renderer.xr.getSession()

    if (session && hitTestSourceREquested == false) {
      session.requestReferenceSpace('viewer').then((referenceSpace) => {
        if (session) {

          session.requestHitTestSource!({ space: referenceSpace })?.then((source) => {
            hitTestSource = source
          })
        }

        hitTestSourceREquested = true
        session.addEventListener('end', () => {
          hitTestSource = null
          hitTestSourceREquested = false;
        })
      })
    }

    if (hitTestSource != null) {
      const hitTestResult = frame.getHitTestResults(hitTestSource);
      if (hitTestResult.length) {
        const hit = hitTestResult[0]
        reticle.visible = true
        if (hit && hit !== null && referenceSpace) {
          console.log(referenceSpace)
          reticle.matrix.fromArray(hit.getPose(referenceSpace)!.transform.matrix)
        }
      } else {
        reticle.visible = false
      }
    }
    const elapsedTime = clock.getElapsedTime()
    control.update(elapsedTime)


    scene.children.forEach((object) => {
      object.name == 'cube'
      object.rotation.y += 0.01
    })
    renderer.render(scene, camera)
  }

}

renderer.setAnimationLoop(tick);

