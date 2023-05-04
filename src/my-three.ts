import { ACESFilmicToneMapping, EquirectangularReflectionMapping, PerspectiveCamera, Quaternion, Scene, Vector3, WebGLRenderer, sRGBEncoding } from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
let bones: any = []
let time = 0;
const animationSpeed = 0.01; 
init();
animate();

function init() {
  const container = document.querySelector("#app") as HTMLElement;
  document.body.appendChild(container);

  camera = new PerspectiveCamera(73, window.innerWidth / window.innerHeight, 0.25, 20);
  camera.position.set(- 1.8, 0.6, 2.7);

  scene = new Scene();

  new RGBELoader()
    .setPath('/public/')
    .load('venice_sunset_1k.hdr', (texture) => {

      texture.mapping = EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

      const loader = new GLTFLoader().setPath('/public/');
      loader.load('tentacule.gltf', (gltf) => {
        const tentacule = gltf.scene;

        let bone = tentacule.getObjectByName('Bone');
        let currentBone = bone?.children;
        
        while(!(currentBone === undefined) && currentBone.length > 0){
          bones.push(currentBone[0]);
          currentBone = currentBone[0].children;
        }

        scene.add(tentacule);
      })

      animate();


    });

  // renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = sRGBEncoding;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render); // use if there is no animation loop
  controls.minDistance = 2;
  controls.maxDistance = 15;
  controls.target.set(0, 0, - 0.2);
  controls.update();

  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  animate()
}


function render() {
  renderer.render(scene, camera);
}


function animate() {
  requestAnimationFrame(animate);
  time += animationSpeed;

  bones.forEach((bone: any, index: number) => {
    const angle = Math.sin(time + index * 0.5) * 0.3;
    bone.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), angle);
    bone.rotation.x = (Math.sin(Date.now() * 0.002) * 0.1 * index) / 3;
  });

  render();
}