import * as THREE from './three.min.js';
import { GLTFLoader } from './GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';
THREE.GLTFLoader = GLTFLoader;
THREE.OrbitControls = OrbitControls;
// fflate for Draco - we skip Draco for now, just standard GLB
export default THREE;
