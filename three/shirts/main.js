import * as THREE from "three";
import * as fflate from "fflate";
import Consts from "./consts.js";


const ModelPath = "models/204m_Basic_KA";
const ModelFile = "204m_Basic_KA.mirl";


class Viewer {

	constructor(canvasElement) {

		this.container = canvasElement;
		this.loadManager = new THREE.LoadingManager()
		
		this.sence = new THREE.Scene();


	}

	init() {

		return this;
	}

	loadModel() {
		const loader = new ByteLoader(this.loadManager);
		loader.loadZipped(ModelPath + "/" + ModelFile, (result) => {
			console.log("loadModel result", result);
			
		}, (err) => {
			console.log("err", err);
		});
	}

	run() { }

	render() { }


	initSence() {
		this.camera = new THREE.PerspectiveCamera(
			Consts.CAMERA_STANDARD_FOV,
			this.dimensions.viewer.width / this.dimensions.viewer.height,
			0.01,
			100
		);
		//this.zoomController.setCamera(this.camera);
		this.camera.position.z = 50;
		try {
			this.renderer = new THREE.WebGLRenderer(Consts.RENDER_PARAMS);
			this.renderer.setPixelRatio(Consts.DEVICE_PIXEL_RATIO);
		} catch {
			return;
		}
		this.renderer.context.drawingBufferHeight < 10 ||
			(this.renderer.setSize(
				this.dimensions.viewer.width,
				this.dimensions.viewer.height
			),
			this.container.appendChild(this.renderer.domElement),
			this.insertLights(),
			this.appendLostContextEvents(),
			this.calcViewSize(),
			this.readWebGLBrowserLimits());
	}

	static createDirectionalLight() {
		const d = new THREE.DirectionalLight(16777215);
		d.position.set(5, 5, 25); 
		return d;
	}

	insertLights() {
		this.scene.add(new THREE.AmbientLight(2105376));
		this.scene.add(Viewer.createDirectionalLight());
	}

	appendLostContextEvents() {
		const self = this;
		this.renderer.context.canvas.addEventListener(
			"webglcontextlost",
			function (t) {
				t.preventDefault(),
					window.cancelAnimationFrame(self.animationRequestId),
					self.recreateRenderer();
			},
			!1
		);
	}


	calcViewSize() {
		let e, t;
		this.container.offsetParent !== null
			? (document.getElementsByClassName(".contentKonfi")[0] !== void 0 &&
				(this.container.parentElement.style.height =
					document.getElementsByClassName(".contentKonfi")[0].style.height),
				(e = this.container.offsetParent.clientWidth),
				(t = this.container.offsetParent.clientHeight))
			: ((e = this.container.clientWidth), (t = this.container.clientHeight)),
			(this.dimensions.viewer.width = e),
			(this.dimensions.viewer.height = t),
			this.renderer.setSize(e, t, !0),
			(this.camera.aspect = e / t),
			this.camera.updateProjectionMatrix(),
			this.doRender();
	}


	readWebGLBrowserLimits() {
		const ctx = this.renderer.getContext();
		this.webGLBrowserLimits = {
			maxViewPortDims: ctx.getParameter(ctx.MAX_VIEWPORT_DIMS),
			maxTextures: ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS),
			maxVertexTextures: ctx.getParameter(ctx.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
			maxCombinedTextures: ctx.getParameter(ctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
			maxTextureSize: ctx.getParameter(ctx.MAX_TEXTURE_SIZE),
			maxCubeMapTextureSize: ctx.getParameter(ctx.MAX_CUBE_MAP_TEXTURE_SIZE),
		};
	}
}

class MirlByteData {
	constructor(dataByteArr) {
		this.parserIndex = 0;
		this.FileLength = 0;
		this.FileVersion = "";
		this.mirlDataByteArray = dataByteArr;
		this.loadFileLength();
		this.loadFileVersion();
	}

	loadFileLength() {
		(this.FileLength = this.mirlDataByteArray.byteLength),
			this.FileLength < 1 && console.error("There was no file loaded! ");
	}

	loadFileVersion() {
		(this.FileVersion = this.readString()),
			this.FileVersion.indexOf("v1.1") !== 0 &&
			console.error(
				"This MIRL file version is not supported! - " + this.FileVersion
			);
	}

	readByte() {
		const e = this.mirlDataByteArray[this.parserIndex];
		return (this.parserIndex = this.parserIndex + 1), e;
	}

	readWord() {
		let e;
		return (
			(e = this.mirlDataByteArray[this.parserIndex]),
			(e = e + this.mirlDataByteArray[this.parserIndex + 1] * 256),
			(this.parserIndex = this.parserIndex + 2),
			e
		);
	}

	readInteger() {
		let e;
		return (
			(e = this.mirlDataByteArray[this.parserIndex]),
			(e = e + this.mirlDataByteArray[this.parserIndex + 1] * 256),
			(e = e + this.mirlDataByteArray[this.parserIndex + 2] * 65536),
			(e = e + this.mirlDataByteArray[this.parserIndex + 3] * 16777216),
			(this.parserIndex = this.parserIndex + 4),
			e
		);
	}
	readFloat() {
		let e = "",
			t;
		for (t = 0; t < 4; t += 1)
			e = e + String.fromCharCode(this.mirlDataByteArray[this.parserIndex + t]);
		const n = MirlByteData.binCharsToFloat(e);
		return (this.parserIndex = this.parserIndex + 4), n;
	}
	readString() {
		const e = this.readInteger();
		let t = "",
			n;
		for (n = 0; n < e; n += 1)
			t = t + String.fromCharCode(this.mirlDataByteArray[this.parserIndex + n]);
		return (this.parserIndex = this.parserIndex + e), t;
	}
	seek(e) {
		this.parserIndex = e;
	}
	EoF() {
		return this.parserIndex >= this.FileLength;
	}
	static binCharsToFloat(e) {
		let t;
		if (e === null || ((e = e.toString()), e.length < 4)) return;
		const n = this.getBitsFromString(e),
			r = parseInt(n[0], 10) ? -1 : 1,
			o = parseInt(n.substring(1, 9), 2) - 127;
		return (
			o === -127 ? (t = 0) : (t = this.getMantisse(n)),
			parseFloat((r * Math.pow(2, o) * t).toFixed(3))
		);
	}
	static getMantisse(e) {
		let t = 1,
			n;
		for (n = 0; n < 23; n += 1)
			parseInt(e[9 + n], 10) === 1 && (t = t + 1 / Math.pow(2, n + 1));
		return t;
	}
	static padFromLeftWithZerosToLength(e, t) {
		let n;
		const r = e.length;
		for (n = 0; n < t - r; n += 1) e = "0" + e;
		return e;
	}
	static getBitsFromString(e) {
		let t,
			n,
			r = "";
		for (t = 0; t < 4; t += 1)
			(n = (e.charCodeAt(t) & 255).toString(2)),
				n.length < 8 && (n = this.padFromLeftWithZerosToLength(n, 8)),
				(r = n + r);
		return r;
	}
}

class Dim {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
	}
}


class MirlObject {
	constructor() {
		this.object = new THREE.Object3D();
		this.dimensions = new Dim();
	}
}


class ThreeObjectParse {

	constructor(e, t) {
		this.mirlFile = e;
		this.parent = t;
		this.geometry = new THREE.BufferGeometry();
	}
	getThreeJSObject() {
		const e = new THREE.Mesh(
			this.geometry,
			new THREE.MeshLambertMaterial({ transparent: !1, side: THREE.DoubleSide })
		);
		return (e.name = this.objectname), e;
	}
	parse() {
		this.readObjectHeader();
		this.createObjectStructure();
		this.logHeaderDataToConsole();
		this.readVertices();
		this.readFaces();
		this.readUvs();
	}
	logHeaderDataToConsole() {
		(this.parent.totalVertices += this.anzVertices),
			(this.parent.totalFaces += this.anzFaces);
	}
	createObjectStructure() {
		if (this.anzVertices < 65536) {
			this.indizes = new Uint16Array(this.anzFaces * 3);
			this.geometry.setIndex(new THREE.BufferAttribute(this.indizes, 1));
			this.positions = new Float32Array(this.anzVertices * 3);
			this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
			this.uvs = new Float32Array(this.anzVertices * 2);
			this.geometry.setAttribute("uv", new THREE.BufferAttribute(this.uvs, 2));
		} else {
			this.positions = new Float32Array(this.anzFaces * 3 * 3);
			this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
			this.uvs = new Float32Array(this.anzFaces * 3 * 2);
			this.geometry.setAttribute("uv", new THREE.BufferAttribute(this.uvs, 2));
			this.TempVertices = new Float32Array(this.anzVertices * 3);
		}
	}
	readObjectHeader() {
		(this.objectname = this.mirlFile.readString()),
			(this.anzVertices = this.mirlFile.readInteger()),
			(this.anzFaces = this.mirlFile.readInteger()),
			(this.factorUmrechnungWordToFloatX = this.mirlFile.readFloat()),
			(this.factorUmrechnungWordToFloatY = this.mirlFile.readFloat()),
			(this.factorUmrechnungWordToFloatZ = this.mirlFile.readFloat());
	}
	readUvs() {
		let e, t;
		for (e = 0; e < this.anzFaces; e += 1)
			this.geometry.index
				? this.mirlFile.FileVersion.endsWith("_UVsAsFloat")
					? ((this.uvs[this.indizes[e * 3] * 2] = this.mirlFile.readFloat()),
						(this.uvs[this.indizes[e * 3] * 2 + 1] = this.mirlFile.readFloat()),
						(this.uvs[this.indizes[e * 3 + 1] * 2] = this.mirlFile.readFloat()),
						(this.uvs[this.indizes[e * 3 + 1] * 2 + 1] =
							this.mirlFile.readFloat()),
						(this.uvs[this.indizes[e * 3 + 2] * 2] = this.mirlFile.readFloat()),
						(this.uvs[this.indizes[e * 3 + 2] * 2 + 1] =
							this.mirlFile.readFloat()))
					: ((this.uvs[this.indizes[e * 3] * 2] =
						this.mirlFile.readWord() / 65535),
						(this.uvs[this.indizes[e * 3] * 2 + 1] =
							this.mirlFile.readWord() / 65535),
						(this.uvs[this.indizes[e * 3 + 1] * 2] =
							this.mirlFile.readWord() / 65535),
						(this.uvs[this.indizes[e * 3 + 1] * 2 + 1] =
							this.mirlFile.readWord() / 65535),
						(this.uvs[this.indizes[e * 3 + 2] * 2] =
							this.mirlFile.readWord() / 65535),
						(this.uvs[this.indizes[e * 3 + 2] * 2 + 1] =
							this.mirlFile.readWord() / 65535))
				: ((t = e * 3 * 2),
					this.mirlFile.FileVersion.endsWith("_UVsAsFloat")
						? ((this.uvs[t] = this.mirlFile.readFloat()),
							(this.uvs[t + 1] = this.mirlFile.readFloat()),
							(this.uvs[t + 2] = this.mirlFile.readFloat()),
							(this.uvs[t + 3] = this.mirlFile.readFloat()),
							(this.uvs[t + 4] = this.mirlFile.readFloat()),
							(this.uvs[t + 5] = this.mirlFile.readFloat()))
						: ((this.uvs[t] = this.mirlFile.readWord() / 65535),
							(this.uvs[t + 1] = this.mirlFile.readWord() / 65535),
							(this.uvs[t + 2] = this.mirlFile.readWord() / 65535),
							(this.uvs[t + 3] = this.mirlFile.readWord() / 65535),
							(this.uvs[t + 4] = this.mirlFile.readWord() / 65535),
							(this.uvs[t + 5] = this.mirlFile.readWord() / 65535)));
	}
	readFaces() {
		let e, t, n, r, o;
		for (e = 0; e < this.anzFaces; e += 1)
			this.anzVertices < 256
				? ((n = this.mirlFile.readByte()),
					(r = this.mirlFile.readByte()),
					(o = this.mirlFile.readByte()))
				: this.anzVertices < 65536
					? ((n = this.mirlFile.readWord()),
						(r = this.mirlFile.readWord()),
						(o = this.mirlFile.readWord()))
					: ((n = this.mirlFile.readInteger()),
						(r = this.mirlFile.readInteger()),
						(o = this.mirlFile.readInteger())),
				this.geometry.index
					? ((this.indizes[e * 3] = n),
						(this.indizes[e * 3 + 1] = r),
						(this.indizes[e * 3 + 2] = o))
					: ((n = n * 3),
						(r = r * 3),
						(o = o * 3),
						(t = e * 3 * 3),
						(this.positions[t] = this.TempVertices[n]),
						(this.positions[t + 1] = this.TempVertices[n + 1]),
						(this.positions[t + 2] = this.TempVertices[n + 2]),
						(this.positions[t + 3] = this.TempVertices[r]),
						(this.positions[t + 4] = this.TempVertices[r + 1]),
						(this.positions[t + 5] = this.TempVertices[r + 2]),
						(this.positions[t + 6] = this.TempVertices[o]),
						(this.positions[t + 7] = this.TempVertices[o + 1]),
						(this.positions[t + 8] = this.TempVertices[o + 2]));
	}
	readVertices() {
		let e, t, n, r, o;
		for (e = 0; e < this.anzVertices; e += 1)
			(n = this.mirlFile.readWord() / this.factorUmrechnungWordToFloatX),
				(o = -this.mirlFile.readWord() / this.factorUmrechnungWordToFloatY),
				(r = this.mirlFile.readWord() / this.factorUmrechnungWordToFloatZ),
				(t = e * 3),
				this.geometry.index
					? ((this.positions[t] = n),
						(this.positions[t + 1] = r),
						(this.positions[t + 2] = o))
					: ((this.TempVertices[t] = n),
						(this.TempVertices[t + 1] = r),
						(this.TempVertices[t + 2] = o)),
				this.parent.compareDimensionsToDimensionExtremes(n, r, o);
	}
}

class ByteLoader {
	constructor(loadManager) {
		this.mirlFile = null;
		this.result = new MirlObject();
		this.totalVertices = 0;
		this.totalFaces = 0;
		this.LastLoadedMinX = Number.MAX_VALUE;
		this.LastLoadedMaxX = -Number.MAX_VALUE;
		this.LastLoadedMinY = Number.MAX_VALUE;
		this.LastLoadedMaxY = -Number.MAX_VALUE;
		this.LastLoadedMinZ = Number.MAX_VALUE;
		this.LastLoadedMaxZ = -Number.MAX_VALUE;
		this.manager = loadManager !== void 0 ? loadManager : THREE.DefaultLoadingManager;
	}

	loadZipped(url, callback, onerror) {
		const self = this;
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url, !0);
		xhr.responseType = "arraybuffer";

		xhr.onload = function () {
			let res = xhr.response;
			if (res) {
				let dataArr = new Uint8Array(res);

				fflate.gunzip(dataArr, {}, (err, data) => {

					self.mirlFile = new MirlByteData(data);
					callback(self.parse());
					
					dataArr = null;
					res = null;
					self.mirlFile = null;
				});
			}
		};
		xhr.onerror = onerror;
		xhr.send(null);
	}

	load(e, t, n) {
		const r = this,
			o = new XMLHttpRequest();
		o.open("GET", e, !0),
			(o.responseType = "arraybuffer"),
			(o.onload = function () {
				let l = o.response;
				l &&
					((r.mirlFile = new MirlByteData(new Uint8Array(l))),
						t(r.parse()),
						(r.mirlFile = null),
						(l = null));
			}),
			(o.onerror = n),
			o.send(null);
	}
	parse() {
		return (
			this.loadModelObjects(),
			this.moveObjectGroupOverOrigin(),
			this.makeThreeJSUpdateAllGeometries(),
			this.setResultDimensions(),
			this.result
		);
	}
	moveObjectGroupOverOrigin() {
		let e, t;
		const n = this.result.object.children;
		for (e = 0, t = n.length; e < t; e += 1)
			ByteLoader.moveThreeJSObject(n[e].geometry, this.getCenterOfAllObjects());
	}
	makeThreeJSUpdateAllGeometries() {
		let e, t;
		const n = this.result.object.children;
		for (e = 0, t = n.length; e < t; e += 1)
			ByteLoader.makeThreeJSUpdateGeometry(n[e].geometry);
	}
	setResultDimensions() {
		(this.result.dimensions.x = this.LastLoadedMaxX - this.LastLoadedMinX),
			(this.result.dimensions.y = this.LastLoadedMaxY - this.LastLoadedMinY),
			(this.result.dimensions.z = this.LastLoadedMaxZ - this.LastLoadedMinZ);
	}
	loadModelObjects() {
		for (; !this.mirlFile.EoF();) this.parseModelObjectFromCurrentIndex();
	}
	getCenterOfAllObjects() {
		const e = new Dim();
		return (
			(e.x = (this.LastLoadedMinX + this.LastLoadedMaxX) / 2),
			(e.y = (this.LastLoadedMinY + this.LastLoadedMaxY) / 2),
			(e.z = (this.LastLoadedMinZ + this.LastLoadedMaxZ) / 2),
			e
		);
	}
	static moveThreeJSObject(e, t) {
		let n, r, o;
		for (n = 0, r = e.attributes.position.array.length / 3; n < r; n += 1)
			(o = n * 3),
				(e.attributes.position.array[o] -= t.x),
				(e.attributes.position.array[o + 1] -= t.y),
				(e.attributes.position.array[o + 2] -= t.z);
	}
	static makeThreeJSUpdateGeometry(geometry) {
		geometry.verticesNeedUpdate = true;
		geometry.computeBoundingBox();
		//geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		geometry.computeBoundingSphere();
		geometry.buffersNeedUpdate = true;
		geometry.uvsNeedUpdate = true;
	}
	parseModelObjectFromCurrentIndex() {
		const parser = new ThreeObjectParse(this.mirlFile, this);
		parser.parse();
		this.result.object.add(parser.getThreeJSObject());
	}
	compareDimensionsToDimensionExtremes(e, t, n) {
		e < this.LastLoadedMinX && (this.LastLoadedMinX = e),
			t < this.LastLoadedMinY && (this.LastLoadedMinY = t),
			n < this.LastLoadedMinZ && (this.LastLoadedMinZ = n),
			e > this.LastLoadedMaxX && (this.LastLoadedMaxX = e),
			t > this.LastLoadedMaxY && (this.LastLoadedMaxY = t),
			n > this.LastLoadedMaxZ && (this.LastLoadedMaxZ = n);
	}
}



document.addEventListener("DOMContentLoaded", async function () {
	console.log("DOM fully loaded and parsed");
	console.log("THREE", THREE);

	const viewerElement = document.getElementById("canvas");

	const viewer = new Viewer(viewerElement);
	viewer.init().loadModel();
	viewer.run();

	console.log('DONE');
});
