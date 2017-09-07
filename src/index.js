import AFRAME from 'aframe'
import $ from "jquery"

const points_vert = require('raw-loader!./shaders/points.vert');
const points_frag = require('raw-loader!./shaders/points.frag');

//

var renderer, scene, camera;
var points, material;
var pointer;
var mouseDown;

var raycaster, mouse
var intersects = [];

var threshold = 0.05;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

Math.clip = function(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 40, WIDTH / HEIGHT, 1, 10000 );
  camera.position.z = 5;

  scene = new THREE.Scene();

  var amount = 25000;
  var radius = 1;

  var positions = new Float32Array( amount * 3 );
  var sizes = new Float32Array( amount );
  var randoms = new Float32Array( amount );
  // var indices = new Uint16Array( amount );

  var vertex = new THREE.Vector3();

  for ( var i = 0; i < amount; i++ ) {
    vertex.x = ( Math.random() * 2 - 1 ) * radius;
    vertex.y = ( Math.random() * 2 - 1 ) * radius;
    vertex.z = 0.0;

    vertex.toArray( positions, i * 3 );
    sizes[ i ] = 0.05;
    randoms[ i ] = Math.random() * 2 - 1;
    // indices[ i ] = i;
  }

  var geometry = new THREE.BufferGeometry();
  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
  geometry.addAttribute( 'random', new THREE.BufferAttribute( randoms, 1 ) );

  material = new THREE.ShaderMaterial({
    uniforms: {
      radius: { value: 0.0 },
      expand: { value: 0.0 },
      explode: { value: 0.0 },
      intersect: { value: new THREE.Vector3( 0, 0, 0 ) }
    },
    vertexShader: points_vert,
    fragmentShader: points_frag
  });

  //

  points = new THREE.Points( geometry, material );
  scene.add( points );

  //

  var pointerGeo = new THREE.SphereGeometry( 0.05, 8, 8 );
  var pointerMat = new THREE.MeshBasicMaterial({
    color: 0xffffff ,
    transparent: true,
    opacity: 0.0
  });
  pointer = new THREE.Mesh( pointerGeo, pointerMat );
  scene.add( pointer );

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( WIDTH, HEIGHT );

  raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = threshold;
  mouse = new THREE.Vector2();

  var container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  //

  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onMouseUp, false );

  mouseDown = 0;
  document.body.onmousedown = function() {
      mouseDown = 1;
  }
  document.body.onmouseup = function() {
      mouseDown = 0;
  }
}

function onMouseUp() {
  if ( material.uniforms.expand.value === 1 ) {
    // UP
    $({animValue: 0}).animate({animValue: 1}, {
      duration: 250,
      complete: function() {
        onAnimComplete();
      },
      step: function() {
        material.uniforms.explode.value = this.animValue;
      }
    });

    // DOWN
    function onAnimComplete() {
      $({animValue: 1}).animate({animValue: 0}, {
        duration: 1000,
        step: function() {
          material.uniforms.explode.value = this.animValue;
        }
      });
    }
  }
}

function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  intersects = raycaster.intersectObject( points );
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
  var intersect = ( intersects.length ) > 0 ? intersects[ 0 ] : null;

  // ANIMATE UNIFORMS
  var unif = material.uniforms;
  if ( intersect ) {

    unif.radius.value += 0.1;
    unif.radius.value = Math.clip(unif.radius.value, 0.0, 1.0);
    unif.intersect.value = intersect.point;

    pointer.position.copy( intersect.point );
    pointer.material.opacity += 0.1;
    pointer.material.opacity = Math.clip(pointer.material.opacity, 0.0, 1.0);

    if ( mouseDown ) {
      unif.expand.value += 0.075;
      unif.expand.value = Math.clip(unif.expand.value, 0.0, 1.0);
    }

  } else if ( intersect === null ) {

    unif.radius.value -= 0.1;
    unif.radius.value = Math.clip(unif.radius.value, 0.0, 1.0);

    pointer.material.opacity -= 0.05;
    pointer.material.opacity = Math.clip(pointer.material.opacity, 0.0, 1.0);
  }

  if ( !mouseDown ) {
    unif.expand.value -= 0.075;
    unif.expand.value = Math.clip(unif.expand.value, 0.0, 1.0);
  }

  renderer.render( scene, camera );
}
