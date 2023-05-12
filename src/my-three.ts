import { ACESFilmicToneMapping, ArrowHelper, Box3, BoxGeometry, Color, EquirectangularReflectionMapping, Mesh, MeshBasicMaterial, PerspectiveCamera, Quaternion, Raycaster, Scene, Vector2, Vector3, WebGLRenderer, sRGBEncoding } from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
let raycaster = new Raycaster();
let cube: Mesh;

init();
animate();


// add event listener to made raycaster follow the mouse
window.addEventListener('mousemove', setPickPosition);

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
    
      cube = addCube(0, 0, 0);

      scene.add(cube);
    
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

function setPickPosition(event: any) {
  const pos: Vector2 = new Vector2(0,0);
  pos.x = (event.clientX / window.innerWidth) * 2 - 1;
  pos.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // cast a ray through the frustum
  raycaster.setFromCamera(pos, camera);
}

function addCube(px: number, py: number, pz: number): Mesh {
  var colorandom = new Color(0xffffff);
  colorandom.setHex(Math.random() * 0xffffff);
  var geometry = new BoxGeometry(0.5, 0.5, 0.5); //x,y,z
  var boxMaterial = new MeshBasicMaterial({ color: colorandom});
  var cube = new Mesh(geometry, boxMaterial);
  // update cube face color to match a different color that is randomly generated
  cube.position.set(px, py, pz);
  cube.geometry.computeBoundingBox(); // null sinon
  return cube;
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

// gravity simulation with collision detection

function animate() {
  requestAnimationFrame(animate);

  const quaternion = new Quaternion();
  quaternion.setFromAxisAngle(new Vector3(0,1,0), 0.01);
  cube.applyQuaternion(quaternion);

  render();
}


