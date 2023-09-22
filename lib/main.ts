const scene = spaceDocument.scene as BABYLON.Scene;

const bodyMaterial = new BABYLON.StandardMaterial('body_mat', scene);
bodyMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.25, 0.25);
bodyMaterial.backFaceCulling = false;

//Array of points for trapezium side of car.
const side = [
  new BABYLON.Vector3(-4, 2, -2),
  new BABYLON.Vector3(4, 2, -2),
  new BABYLON.Vector3(5, -2, -2),
  new BABYLON.Vector3(-7, -2, -2)
];

side.push(side[0]);	//close trapezium

//Array of points for the extrusion path
const extrudePath = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 4)];

//Create body and apply material
const carBody = BABYLON.MeshBuilder.ExtrudeShape('body', { shape: side, path: extrudePath, cap: BABYLON.Mesh.CAP_ALL }, scene);
carBody.material = bodyMaterial;
/*-----------------------End Car Body------------------------------------------*/

/*-----------------------Wheel------------------------------------------*/

//Wheel Material 
var wheelMaterial = new BABYLON.StandardMaterial('wheel_mat', scene);
var wheelTexture = new BABYLON.Texture('http://ar.rokidcdn.com/web-assets/pages/jsar/textures/wheel.png', scene);
wheelMaterial.diffuseTexture = wheelTexture;

//Set color for wheel tread as black
var faceColors = [];
faceColors[1] = new BABYLON.Color3(0, 0, 0);

//set texture for flat face of wheel 
var faceUV = [];
faceUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
faceUV[2] = new BABYLON.Vector4(0, 0, 1, 1);

//create wheel front inside and apply material
var wheelFI = BABYLON.MeshBuilder.CreateCylinder('wheelFI', { diameter: 3, height: 1, tessellation: 24, faceColors: faceColors, faceUV: faceUV }, scene);
wheelFI.material = wheelMaterial;

//rotate wheel so tread in xz plane  
wheelFI.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
wheelFI.parent = carBody;


/*-----------------------End Wheel------------------------------------------*/

/*------------Create other Wheels as Instances, Parent and Position----------*/
var wheelFO = wheelFI.clone('FO');
wheelFO.parent = carBody;
wheelFO.position = new BABYLON.Vector3(-4.5, -2, 2.8);

var wheelRI = wheelFI.clone('RI');
wheelRI.parent = carBody;
wheelRI.position = new BABYLON.Vector3(2.5, -2, -2.8);

var wheelRO = wheelFI.clone('RO');
wheelRO.parent = carBody;
wheelRO.position = new BABYLON.Vector3(2.5, -2, 2.8);

wheelFI.position = new BABYLON.Vector3(-4.5, -2, -2.8);

/*------------End Create other Wheels as Instances, Parent and Position----------*/

/*-----------------------Path------------------------------------------*/

// Create array of points to describe the curve
const points = [];
const n = 450; // number of points
const r = 50; //radius
for (let i = 0; i < n + 1; i++) {
  points.push(new BABYLON.Vector3((r + (r / 5) * Math.sin(8 * i * Math.PI / n)) * Math.sin(2 * i * Math.PI / n), 0, (r + (r / 10) * Math.sin(6 * i * Math.PI / n)) * Math.cos(2 * i * Math.PI / n)));
}

//Draw the curve
const track = BABYLON.MeshBuilder.CreateLines('track', { points: points }, scene);
track.color = new BABYLON.Color3(0, 0, 0);
/*-----------------------End Path------------------------------------------*/

/*-----------------------Ground------------------------------------------*/
const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 3 * r, height: 3 * r }, scene);
{
  const mat = new BABYLON.PBRMaterial('mat', scene);
  mat.albedoColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  mat.metallic = 0;
  mat.roughness = 1;
  mat.sideOrientation = BABYLON.Material.ClockWiseSideOrientation;
  ground.material = mat;
}
/*-----------------------End Ground------------------------------------------*/

/*----------------Position and Rotate Car at Start---------------------------*/
carBody.position.y = 4;
carBody.position.z = r;

var path3d = new BABYLON.Path3D(points);
var normals = path3d.getNormals();
var theta = Math.acos(BABYLON.Vector3.Dot(BABYLON.Axis.Z, normals[0]));
carBody.rotate(BABYLON.Axis.Y, theta, BABYLON.Space.WORLD);
/*----------------End Position and Rotate Car at Start---------------------*/

/*----------------Animation Loop---------------------------*/
var i = 0;
scene.registerAfterRender(function () {
  carBody.position.x = points[i].x;
  carBody.position.z = points[i].z;
  wheelFI.rotate(normals[i], Math.PI / 32, BABYLON.Space.WORLD);
  wheelFO.rotate(normals[i], Math.PI / 32, BABYLON.Space.WORLD);
  wheelRI.rotate(normals[i], Math.PI / 32, BABYLON.Space.WORLD);
  wheelRO.rotate(normals[i], Math.PI / 32, BABYLON.Space.WORLD);

  theta = Math.acos(BABYLON.Vector3.Dot(normals[i], normals[i + 1]));
  var dir = BABYLON.Vector3.Cross(normals[i], normals[i + 1]).y;
  var dir = dir / Math.abs(dir);
  carBody.rotate(BABYLON.Axis.Y, dir * theta, BABYLON.Space.WORLD);

  i = (i + 1) % (n - 1);	//continuous looping  
});