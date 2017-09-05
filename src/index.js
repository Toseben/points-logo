import AFRAME from 'aframe'

const points_vert = require('raw-loader!./shaders/points.vert');
const points_frag = require('raw-loader!./shaders/points.frag');

//

var renderer, scene, camera;
var points, material;

var raycaster, mouse, intersects;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 40, WIDTH / HEIGHT, 1, 10000 );
  camera.position.z = 300;

  scene = new THREE.Scene();

  var amount = 100000;
  var radius = 75;

  var positions = new Float32Array( amount * 3 );
  var sizes = new Float32Array( amount );

  var vertex = new THREE.Vector3();

  for ( var i = 0; i < amount; i++ ) {
    vertex.x = ( Math.random() * 2 - 1 ) * radius;
    vertex.y = ( Math.random() * 2 - 1 ) * radius;
    vertex.z = 0.0;

    vertex.toArray( positions, i * 3 );
    sizes[ i ] = 2.0;
  }

  var geometry = new THREE.BufferGeometry();
  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

  material = new THREE.ShaderMaterial({
    uniforms: {
      intersect: { value: new THREE.Vector3( 0, 0, 0 ) }
    },
    vertexShader: points_vert,
    fragmentShader: points_frag
  });

  //

  points = new THREE.Points( geometry, material );
  scene.add( points );

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( WIDTH, HEIGHT );

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  var container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  //

  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  raycaster.setFromCamera( mouse, camera );
  intersects = raycaster.intersectObject( points );
  var intersect = ( intersects.length ) > 0 ? intersects[ 0 ] : null;

  if ( intersect ) {
    material.uniforms.intersect.value = intersect.point;
  }

  renderer.render( scene, camera );
}
