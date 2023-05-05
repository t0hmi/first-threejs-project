import { ACESFilmicToneMapping, ArrowHelper, Box3, BoxGeometry, Color, EquirectangularReflectionMapping, Mesh, MeshBasicMaterial, PerspectiveCamera, Quaternion, Raycaster, Scene, Vector2, Vector3, WebGLRenderer, sRGBEncoding } from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
let raycaster = new Raycaster();
let cubes: any[] = [];
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
    
      for (let i = 0; i < 50; i++) {
        let px = Math.random() * 10 - 5;
        let py = Math.random() * 10 - 5;
        let pz = Math.random() * 10 - 5;
        let cube = addCube(px, py, pz);
        // made the cube move in a random direction
        let direction = new Vector3(Math.random(), Math.random(), Math.random());
        direction.normalize();
        let quaternion = new Quaternion();
        quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction);
        cube.setRotationFromQuaternion(quaternion);
      }
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

function addCube(px: number, py: number, pz: number) {
  var colorandom = new Color(0xffffff);
  colorandom.setHex(Math.random() * 0xffffff);
  var geometry = new BoxGeometry(0.1, 0.1, 0.1); //x,y,z
  var boxMaterial = new MeshBasicMaterial({ color: colorandom });
  var cube = new Mesh(geometry, boxMaterial);
  cube.position.set(px, py, pz);
  cube.geometry.computeBoundingBox(); // null sinon
  scene.add(cube);
  cubes.push(cube);
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
  cubes.forEach(cube => {
    let direction = new Vector3(0, 0, 0);
    direction.subVectors(scene.position, cube.position);
    const cubeDirection = direction.normalize();
    cube.position.add(cubeDirection.multiplyScalar(0.001));
    // add colision detection between the current box and all the others
    cubes.forEach(otherCube => {
      if (cube != otherCube) {
        let box1 = new Box3();
        box1.setFromObject(cube);
        let box2 = new Box3();
        box2.setFromObject(otherCube);
        if (box1.intersectsBox(box2)) {
          let direction = new Vector3(Math.random(), Math.random(), Math.random());
          direction.subVectors(otherCube.position, cube.position);
          direction.normalize();
          otherCube.position.add(direction.multiplyScalar(0.001));
        }
      }
    });

  });
  render();
}


