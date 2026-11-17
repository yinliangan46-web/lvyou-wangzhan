import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';
// 把扩展挂到 THREE 对象上
THREE.GLTFLoader = GLTFLoader;
THREE.OrbitControls = OrbitControls;
export default THREE;
