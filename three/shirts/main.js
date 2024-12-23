import * as THREE from "three";
import * as fflate from "fflate";
import Consts from "./consts.js";

const ModelPath = "models/204m_Basic_KA";
const ModelFile = "204m_Basic_KA.mirl";

var Se;
(function (r) {
	(r[(r.NOT_GREYED_OUT = 0)] = "NOT_GREYED_OUT"),
		(r[(r.GREYED_OUT = 1)] = "GREYED_OUT"),
		(r[(r.OUT_OF_DRUCKBEREICH_GREYED_OUT = 2)] =
			"OUT_OF_DRUCKBEREICH_GREYED_OUT");
})(Se || (Se = {}));



class Viewer {

	constructor(viewerEl) {

		this.container = viewerEl;
		this.loadManager = new THREE.LoadingManager();
		this.utilityPainter = new UtilityPainter(this);
		
		this.isRendering = false;
		this.scene = new THREE.Scene();
		this.colorValueTexture = Viewer.getColorValueTextureAtConstruction();
		this.colorCodes = [];
		this.dimensions = new ModelDimension(
			window.innerWidth - 20,
			window.innerHeight - 20
		);
		this.zOrderTable = new ZOrderTable();
		this.createPart = (s) => new ObjectPart(this, s, this.zOrderTable)

	}

	init() {
		this.initSence();

		return this;
	}

	loadModel() {
		const loader = new ByteLoader(this.loadManager);
		loader.loadZipped(ModelPath + "/" + ModelFile, (mirlObject) => {
			
			console.log("loadModel result", mirlObject);

			this.renderMirlObject(mirlObject);
			
		}, (err) => {
			console.log("err", err);
		});
	}

	renderMirlObject(mo) {
		Viewer.resetTexture(Viewer.getColorValueTextureAtConstruction());
		Viewer.updateColorValueTexture(this.colorValueTexture, this.colorCodes);

		this.dimensions.model = mo.dimensions;
		this.onLoadedModel(mo);
	}

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

		this.renderer.setSize(this.dimensions.viewer.width, this.dimensions.viewer.height);
		this.container.appendChild(this.renderer.domElement);
		this.insertLights();
		this.appendLostContextEvents();
		this.calcViewSize();
		this.readWebGLBrowserLimits();
	}

	static resetTexture(dataTexture) {
		dataTexture.dispose(),
			(dataTexture = new THREE.DataTexture(new Uint8Array(1024), 256, 1, THREE.RGBAFormat)),
			(dataTexture.minFilter = THREE.NearestFilter),
			(dataTexture.magFilter = THREE.NearestFilter),
			(dataTexture.generateMipmaps = !1);
	}

	static getColorValueTextureAtConstruction() {
		const e = new THREE.DataTexture(new Uint8Array(1024), 256, 1, THREE.RGBAFormat);
		return (
			(e.minFilter = THREE.NearestFilter),
			(e.magFilter = THREE.NearestFilter),
			(e.generateMipmaps = !0),
			e
		);
	}

	static updateColorValueTexture(e, t) {
		for (let n = 0, i = t.length; n < i; n++)
			Viewer.writeColorObjectToTextureDataArray(t[n], e.image.data);
		e.needsUpdate = !0;
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

		this.renderer.getContext().canvas.addEventListener(
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

	addObjectToScene(obj) {		
		const n = new THREE.Object3D();
		n.children = obj.children.map(i => {
			const s = new THREE.Mesh(i.geometry.clone(), i.material.clone());
			s.name = i.name;
			return s;
		});
		n.position.y = 0;
		n.position.x = 0;
		this.calcViewSize();
		this.resetCameraPosition();
		n.traverse(i => {
			if (i instanceof THREE.Mesh) {
				//i.BVHTree = LBVH.createTree(i);
				this.modelParts[i.name] = this.createPart(i);
				this.modelObjects.push(i);
			}
		});
		this.scene.add(n);
	}

	static loadPartsJSON() {
		return fetch('models/parts.json');
	}

	onLoadedModel(mo) {
		//this.features = features;
		this.utilityPainter.clearAllLayers();
		this.addObjectToScene(mo.object);


		Viewer.loadPartsJSON().then((res) => {

			console.log("loadPartsJSON", res);

			// self.setNichtEinfaerbbaresPartImageFlagTrueOnAllParts();
			
			// ue.parsePartsJSON(s, self.modelParts),
			// mn.loadSperrbezirkJSON(cut, model, self.modelParts),
			// self.loadTeilungslinienJSON(cut, model),
			// p
			// 	.createTask("init_owayoJSViewer")
			// 	.when("entwurfInitialized", "done")
			// 	.thenDo(() => self.initModel()),
			// ViewGlobal.resourceManager.registerLoadedResourceWithoutData(
			// 	"owayoJSViewerWithSelObs_parts.json_Loaded",
			// 	Ee.PRODUCTCHANGE
			// );
		});
	}

	resetCameraPosition() {
		const maxDimension = this.dimensions.getMaxModelDimension();
		this.camera.position.z = this.getCameraPositionThatSeesAllOfTheModel(maxDimension);
		this.camera.near = this.camera.position.z - maxDimension / 1.1;
		this.camera.far = this.camera.position.z + maxDimension / 1.5;
		this.camera.updateProjectionMatrix();
		this.render();
	}

	getCameraPositionThatSeesAllOfTheModel(e) {
		let t = this.camera.fov / 2;
		return (
			e === this.dimensions.model.x && (t *= this.camera.aspect),
			e / 2 / Math.tan((t * Math.PI) / 180) +
			Math.max(4, this.dimensions.model.z)
		);
	}

	render() {
		if (!this.isRendering) {
			this.isRendering = true;
			setTimeout(() => {
				this.isRendering = false;
				this.animationRequestId = window.requestAnimationFrame(() => this.doRender());
			}, 1000 / Consts.FPS_LIMIT);
		}
	}


	doRender() {
		// this.renderer.autoClear = false;
		// const maxShaders = this.getMaxShaders();
		// this.renderer.render(this.scene, this.camera, undefined, true);
		
		// for (let i = 1; i < maxShaders; i++) {
		// 	this.setAllPartShadersToShaderIndex(i);
		// 	this.renderer.render(this.scene, this.camera, undefined, false);
		// }
		
		// this.setModelPartMeshesToNotVisible();
		// this.utilityPainter.setNonEmptyLayersVisibleAndToHandleShader();
		// this.renderer.render(this.scene, this.camera, undefined, false);
		// this.setAllPartShadersToShaderIndex(0);
	}

}

class ModelDimension {
	constructor(e, t) {
		(this.getMaxModelDimension = () =>
			Math.max(this.model.x, this.model.y, this.model.z)),
			(this.viewer = { width: e, height: t }),
			(this.model = { x: 0, y: 0, z: 0 });
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


class UtilityPainter {
	constructor(e) {
		(this.nonEmptyLayers = []),
			(this.isFadingOut = !1),
			(this.fadingAlpha = 1),
			(this.fadeOutIntervallID = -1),
			(this.snaps = []),
			(this.activeSnaps = []),
			(this.sortedSnaps = { horizontal: [], vertical: [], multiLine: [] }),
			(this.clearAllLayers = () => {
				for (let t = this.nonEmptyLayers.length - 1; t > -1; t--)
					this.clearLayer(this.nonEmptyLayers[t]);
			}),
			(this.parent = e);
	}
	clearActiveSnaps() {
		(this.activeSnaps = []),
			(this.sortedSnaps.horizontal = []),
			(this.sortedSnaps.multiLine = []),
			(this.sortedSnaps.vertical = []);
	}
	paintSelectionBorders() {
		if (this.parent.selectedObject !== null) {
			this.paintObjectBorder(
				this.parent.selectedObject.id,
				this.parent.selectedObject.isConflicted()
			);
			for (let e = 0, t = this.parent.entangledObjects.length; e < t; e++)
				this.paintObjectBorder(
					this.parent.entangledObjects[e].id,
					this.parent.entangledObjects[e].isConflicted()
				);
		}
	}
	paintObjectBorder(e, t = !1) {
		typeof t > "u" && (t = !1);
		const n = this.parent.getPartSelObById(e);
		if (n === null) return;
		const i = n.getPartCanvasMinMaxCoordinates(),
			s = n.getParent().handleAndGuideLayer;
		s.anzRectangles < s.rectangles.length &&
			((s.rectangles[s.anzRectangles].x = i.minX),
				(s.rectangles[s.anzRectangles].y = i.maxY),
				(s.rectangles[s.anzRectangles].z = i.maxX),
				(s.rectangles[s.anzRectangles].w = i.minY),
				(s.rectangleColors[s.anzRectangles] = t ? 1 : 0),
				(s.parent.handleShader.uniforms.rectangles.value[s.anzRectangles].x =
					i.minX),
				(s.parent.handleShader.uniforms.rectangles.value[s.anzRectangles].y =
					i.maxY),
				(s.parent.handleShader.uniforms.rectangles.value[s.anzRectangles].z =
					i.maxX),
				(s.parent.handleShader.uniforms.rectangles.value[s.anzRectangles].w =
					i.minY),
				(s.parent.handleShader.uniforms.rectangleColors.value[s.anzRectangles] = t
					? 1
					: 0),
				s.anzRectangles++,
				(s.parent.handleShader.uniforms.anzRectangles.value = s.anzRectangles)),
			this.addToNonEmptyLayers(s);
	}
	static getSnappedByPartResult(e) {
		return {
			minX: Math.min(e.points[0].x, e.points[1].x),
			maxX: Math.max(e.points[0].x, e.points[1].x),
			minY: Math.min(e.points[0].y, e.points[1].y),
			maxY: Math.max(e.points[0].y, e.points[1].y),
		};
	}
	static getMaxWithinBoundary(e, t, n) {
		return isNaN(e) ? Math.min(n, t) : Math.min(n, Math.max(e, t));
	}
	static getMinGreaterZero(e, t) {
		return isNaN(e) ? Math.max(0, t) : Math.max(0, Math.min(e, t));
	}
	isSnapToClone(e, t) {
		for (let n = 0, i = e.snappedBy.length; n < i; n++) {
			const s = this.parent.getPartSelObById(e.snappedBy[n]);
			if (s.getParentPartName() === e.partName && t.cloneIds.indexOf(s.id) > -1)
				return !0;
		}
		return !1;
	}
	static getIntersectionWithPortallines(e, t) {
		for (let n = 0, i = t.length; n < i; n++)
			if (t[n].presentOnPart(e.partName)) return t[n].intersectionPoint(e);
		return null;
	}
	static adjustExtremes(e, t, n) {
		return (
			(e.maxX = UtilityPainter.getMaxWithinBoundary(e.maxX, t.maxX, n.x)),
			(e.minX = UtilityPainter.getMinGreaterZero(e.minX, t.minX)),
			(e.maxY = UtilityPainter.getMaxWithinBoundary(e.maxY, t.maxY, n.y)),
			(e.minY = UtilityPainter.getMinGreaterZero(e.minY, t.minY)),
			e
		);
	}
	getSnapExtremes(e) {
		if (e.snappedBy.some((i) => i === "part"))
			return UtilityPainter.getSnappedByPartResult(e);
		const t = this.parent.modelParts[e.partName].textureSize;
		let n = { minX: NaN, maxX: NaN, minY: NaN, maxY: NaN };
		for (let i = 0, s = e.snappedBy.length; i < s; i++) {
			const o = this.parent.getPartSelObById(e.snappedBy[i]);
			if (e.isSelfSnap(o)) continue;
			const a = o.getPartCanvasMinMaxCoordinates();
			if (o.getParentPartName() === e.partName) n = UtilityPainter.adjustExtremes(n, a, t);
			else {
				if (this.isSnapToClone(e, o)) continue;
				const c = UtilityPainter.getIntersectionWithPortallines(e, this.parent.portalLines);
				if (c === null) break;
				n = UtilityPainter.adjustExtremes(
					n,
					{ minX: c.x, maxX: c.x, minY: c.y, maxY: c.y },
					t
				);
			}
		}
		return n;
	}
	paintVerticalLine(e, t, n) {
		const i = UtilityPainter.getVerticalVector(e, this.getSnapExtremes(e));
		(t.verticalLines[t.anzVerticalLines] = i),
			(n.verticalLines.value[t.anzVerticalLines] = i),
			t.anzVerticalLines++,
			(n.anzVerticalLines.value = t.anzVerticalLines);
	}
	paintHorizontalLine(e, t, n) {
		const i = UtilityPainter.getHorizontalVector(e, this.getSnapExtremes(e));
		(t.horizontalLines[t.anzHorizontalLines] = i),
			(n.horizontalLines.value[t.anzHorizontalLines] = i),
			t.anzHorizontalLines++,
			(n.anzHorizontalLines.value = t.anzHorizontalLines);
	}
	static getHorizontalVector(e, t) {
		return new THREE.Vector3(e.points[0].y, t.minX, t.maxX);
	}
	static getVerticalVector(e, t) {
		return new THREE.Vector3(e.points[0].x, t.minY, t.maxY);
	}
	paintSnap(e) {
		const t = this.parent.modelParts[e.partName],
			n = t.handleShader.uniforms,
			i = t.handleAndGuideLayer;
		switch (e.category) {
			case "vertical":
				this.paintVerticalLine(e, i, n);
				break;
			case "horizontal":
				this.paintHorizontalLine(e, i, n);
				break;
			case "multiLine":
				for (let s = 1, o = e.points.length; s < o; s++)
					i.anzMatrices++,
						(n.anzMatrices.value = i.anzMatrices),
						(n.matrices.value[i.anzMatrices - 1] = e.getMatrixForPoints(
							s - 1,
							s
						));
				break;
			default:
				ViewGlobal.controller.handleError(
					"internal",
					"paintSnap",
					"unknown Snap Category " + e.category
				);
		}
		this.addToNonEmptyLayers(i);
	}
	clearLayer(e) {
		(e.anzRectangles = 0),
			(e.parent.handleShader.uniforms.anzRectangles.value = 0),
			(e.anzMatrices = 0),
			(e.anzHorizontalLines = 0),
			(e.anzVerticalLines = 0),
			(e.parent.handleShader.uniforms.anzMatrices.value = 0),
			(e.parent.handleShader.uniforms.anzHorizontalLines.value = 0),
			(e.parent.handleShader.uniforms.anzVerticalLines.value = 0),
			this.removeFromNonEmptyLayersIfPresent(e);
	}
	removeFromNonEmptyLayersIfPresent(e) {
		for (let t = this.nonEmptyLayers.length - 1; t > -1; t--)
			if (this.nonEmptyLayers[t] === e) {
				this.nonEmptyLayers.splice(t, 1);
				return;
			}
	}
	addToNonEmptyLayers(e) {
		this.nonEmptyLayers.indexOf(e) === -1 && this.nonEmptyLayers.push(e);
	}
	fadeOut(e = 0) {
		if (this.nonEmptyLayers.length === 0) {
			this.isFadingOut = !1;
			return;
		}
		typeof e > "u" && ((e = 0), (this.fadingAlpha = 1)),
			(this.isFadingOut = !0),
			this.fadingAlpha <= 0.1
				? (this.fadingAlpha = 0)
				: ((this.fadingAlpha =
					-(1 / Math.pow(Consts.HELPER_FADEOUT_STEPS, 2)) * Math.pow(e, 2) + 1),
					(e += 1));
		for (let t = 0, n = this.nonEmptyLayers.length; t < n; t++)
			this.nonEmptyLayers[t].parent.handleShader.uniforms.textureAlpha.value =
				this.fadingAlpha;
		if ((this.parent.render(), this.fadingAlpha <= 0)) {
			this.finishFadeOut();
			return;
		}
		this.fadeOutIntervallID = setTimeout(() => this.fadeOut(e), 50);
	}
	resetFading() {
		let e, t;
		for (
			clearTimeout(this.fadeOutIntervallID),
			this.isFadingOut = !1,
			this.fadingAlpha = 1,
			e = 0,
			t = this.nonEmptyLayers.length;
			e < t;
			e++
		)
			this.nonEmptyLayers[
				e
			].parent.handleShader.uniforms.textureAlpha.value = 1;
		this.parent.render();
	}
	finishFadeOut(e = !0) {
		(this.isFadingOut = !1),
			clearTimeout(this.fadeOutIntervallID),
			e === !1
				? ((this.fadingAlpha = 1),
					this.setNonEmptyLayersTextureAlphaToFadingAlpha())
				: ((this.fadingAlpha = -1),
					this.setNonEmptyLayersTextureAlphaToFadingAlpha()),
			this.parent.render();
	}
	setNonEmptyLayersTextureAlphaToFadingAlpha() {
		let e, t;
		for (e = 0, t = this.nonEmptyLayers.length; e < t; e++)
			this.nonEmptyLayers[e].parent.handleShader.uniforms.textureAlpha.value =
				this.fadingAlpha;
		return { i: e, len: t };
	}
	restartFading() {
		const e = this;
		this.isFadingOut && this.resetFading(),
			(this.isFadingOut = !0),
			(this.fadeOutIntervallID = setTimeout(function () {
				e.fadeOut();
			}, Consts.HELPER_FADEOUT_START));
	}
	markSnappedObjects() {
		let e,
			t,
			n,
			i = [];
		for (e = 0, t = this.activeSnaps.length; e < t; e++)
			(n = this.snaps[this.activeSnaps[e]].snappedBy),
				(i = this.markSnappedObjectsBySnappedBy(n, i));
	}
	markSnappedObjectsBySnappedBy(e, t) {
		let n, i;
		for (n = 0, i = e.length; n < i; n++)
			e[n].indexOf("part") === -1 &&
				t.indexOf(e[n]) === -1 &&
				(this.paintObjectBorder(e[n]),
					t.push(e[n]),
					(t = this.paintObjectBordersOnClones(
						this.parent.getPartSelObById(e[n]),
						t
					)));
		return t;
	}
	paintObjectBordersOnClones(e, t) {
		let n, i;
		for (n = 0, i = e.cloneIds.length; n < i; n++)
			t.indexOf(e.cloneIds[n]) === -1 &&
				(this.paintObjectBorder(e.cloneIds[n]), t.push(e.cloneIds[n]));
		return t;
	}
	paintActiveSnapLines() {
		this.paintSnaps(this.sortedSnaps.horizontal),
			this.paintSnaps(this.sortedSnaps.vertical),
			this.paintSnaps(this.sortedSnaps.multiLine);
	}
	paintSnaps(e) {
		let t, n;
		for (t = 0, n = e.length; t < n; t++) this.paintSnap(e[t]);
	}
	repaint() {
		let e, t;
		for (
			this.clearAllLayers(),
			this.paintSelectionBorders(),
			this.setActiveSnaps(),
			this.paintActiveSnapLines(),
			this.markSnappedObjects(),
			this.parent.selectedObject !== null &&
			this.addToNonEmptyLayers(
				this.parent.selectedObject.getParent().handleAndGuideLayer
			),
			e = 0,
			t = this.parent.entangledObjects.length;
			e < t;
			e++
		)
			this.addToNonEmptyLayers(
				this.parent.entangledObjects[e].getParent().handleAndGuideLayer
			);
	}
	static snapShouldBePainted(e, t) {
		let n,
			i,
			s = !1;
		for (n = 0, i = e.snappedBy.length; n < i; n++)
			U(t.selectableObjects, "id", e.snappedBy[n]) && (s = !0);
		return s;
	}
	pushSnapToSortedSnapsAccordingToCategory(e) {
		switch (e.category) {
			case "horizontal":
				this.sortedSnaps.horizontal.push(e);
				break;
			case "vertical":
				this.sortedSnaps.vertical.push(e);
				break;
			default:
				this.sortedSnaps.multiLine.push(e);
		}
	}
	calculateSnapsOfSelOb(e) {
		let t, n, i, s;
		for (t = 0, n = this.snaps.length; t < n; t++)
			(s = this.snaps[t]),
				!(s.snappedBy.indexOf(e.id) === -1 || s.isSelfSnap(e)) &&
				((i = this.parent.modelParts[s.partName]),
					UtilityPainter.snapShouldBePainted(s, i) &&
					(this.activeSnaps.push(t),
						this.pushSnapToSortedSnapsAccordingToCategory(s)));
	}
	setActiveSnaps() {
		let e, t, n;
		if (
			this.parent.selectedObject === null ||
			this.parent.selectedObject.type === b.COMMENT
		)
			return;
		const i = this.parent.entangledObjects.slice(0);
		for (
			i.push(this.parent.selectedObject),
			this.activeSnaps = [],
			this.emptySortedSnaps(),
			e = 0,
			t = i.length;
			e < t;
			e++
		)
			(n = i[e]), this.calculateSnapsOfSelOb(n);
		this.sortedSnaps.horizontal.sort(function (s, o) {
			return s.points[0].y - o.points[0].y;
		}),
			this.sortedSnaps.vertical.sort(function (s, o) {
				return s.points[0].x - o.points[0].x;
			});
	}
	emptySortedSnaps() {
		(this.sortedSnaps.horizontal = []),
			(this.sortedSnaps.vertical = []),
			(this.sortedSnaps.multiLine = []);
	}
	addSnapsForSelOb(e, t = !1) {
		if ((typeof t > "u" && (t = !1), e.floating === Consts.FLOAT_BOTTOM)) return;
		let n, i, s;
		const o = e.getPartCanvasMinMaxCoordinates(),
			a = UtilityPainter.getSnapValuesForPartSelOb(e, o);
		if (
			(this.registerObjectToObjectSnaps(e.getParentPartName(), a, e.id),
				this.parent.cloneObjectToObjectSnaps(e.getParentPartName(), a, e.id),
				this.registerObjectToPartSnaps(e.translation, e.id),
				!t)
		)
			for (n = 0, i = e.cloneIds.length; n < i; n++)
				(s = this.parent.getPartSelObById(e.cloneIds[n])),
					this.addSnapsForSelOb(s, !0);
	}
	static getSnapValuesForPartSelOb(e, t) {
		return [
			{
				points: [
					{ x: e.translation.x, y: 0 },
					{ x: e.translation.x, y: e.getParent().textureSize.y },
				],
				edge: "middle",
				category: "vertical",
			},
			{
				points: [
					{ x: t.minX, y: 0 },
					{ x: t.minX, y: e.getParent().textureSize.y },
				],
				edge: "left",
				category: "vertical",
			},
			{
				points: [
					{ x: t.maxX, y: 0 },
					{ x: t.maxX, y: e.getParent().textureSize.y },
				],
				edge: "right",
				category: "vertical",
			},
			{
				points: [
					{ x: 0, y: e.translation.y },
					{ x: e.getParent().textureSize.x, y: e.translation.y },
				],
				edge: "middle",
				category: "horizontal",
			},
			{
				points: [
					{ x: 0, y: t.minY },
					{ x: e.getParent().textureSize.x, y: t.minY },
				],
				edge: "top",
				category: "horizontal",
			},
			{
				points: [
					{ x: 0, y: t.maxY },
					{ x: e.getParent().textureSize.x, y: t.maxY },
				],
				edge: "bottom",
				category: "horizontal",
			},
		];
	}
	removeSnaps(e, t) {
		this.snaps = this.removeSnapsFromArray(e, t);
	}
	changeSnapsForSelOb(e) {
		e.type !== b.COMMENT &&
			(this.removeSnaps(e.id),
				this.parent.removeClonedSnaps(e.getParentPartName(), e.id),
				this.addSnapsForSelOb(e));
	}
	registerObjectToPartSnaps(e, t) {
		const n = this.parent.getPartSelObById(t).getParentPartName();
		for (let i = 0; i < this.snaps.length; i++)
			this.snaps[i].snappedBy.indexOf("part") > -1 &&
				this.snaps[i].partName === n &&
				UtilityPainter.registerObjectToPartSnapInSnap(e, t, this.snaps[i]);
	}
	static registerObjectToPartSnapInSnap(e, t, n) {
		for (let i = 1; i < n.points.length; i++)
			if (
				n.snappedBy.indexOf(t) === -1 &&
				F.distToSegment(e, n.points[i - 1], n.points[i]).distance < 0.1
			) {
				n.snappedBy.push(t);
				return;
			}
	}
	registerObjectToObjectSnaps(e, t, n) {
		for (let i = t.length - 1; i > -1; i--) {
			const s = t[i],
				o = this.getSnappingSnap(e, s);
			o !== null
				? o.snappedBy.indexOf(n) === -1 && o.snappedBy.push(n)
				: this.insertNewSnap(s, n, e);
		}
	}
	insertNewSnap(e, t, n) {
		this.snaps.push(new qn(e.points, t, e.edge, n, e.category, e.name));
	}
	getSnappingSnap(e, t) {
		let n = null,
			i;
		for (i = 0; i < this.snaps.length; i++)
			if (
				this.snaps[i].snappedBy.indexOf("part") === -1 &&
				this.snaps[i].partName === e &&
				t.edge === this.snaps[i].forEdge &&
				Math.abs(this.snaps[i].points[0].x - t.points[0].x) < 0.01 &&
				Math.abs(this.snaps[i].points[0].y - t.points[0].y) < 0.01
			) {
				n = this.snaps[i];
				break;
			}
		return n;
	}
	removeSnapsFromArray(e, t) {
		let n,
			i,
			s = !1;
		for (
			t === "notPortalLines" && (s = !0), n = this.snaps.length - 1;
			n > -1;
			n--
		)
			(s && this.snaps[n].name === "PortalLine") ||
				((i = this.snaps[n].snappedBy.indexOf(e)),
					i > -1 &&
					(this.snaps[n].snappedBy.splice(i, 1),
						this.snaps[n].snappedBy.length === 0 && this.snaps.splice(n, 1)));
		return this.snaps;
	}
	snapsForCoordinate(e, t, n, i, s = !1) {
		let o, a;
		const c = { point: null, edges: "", snappedSnaps: [] },
			u = this.parent.getPartSelObById(n),
			S = new MouseInfo(e.x - u.translation.x, e.y - u.translation.y),
			v = u.cloneIds;
		if (!s)
			for (let C = 0, A = v.length; C < A; C++) {
				const Y = this.parent.getPartSelObById(v[C]),
					L = Y.getPartCanvasMinMaxCoordinates(),
					N = this.snapsForCoordinate(
						new MouseInfo(Y.translation.x + S.x, Y.translation.y + S.y),
						new Si(L.maxX - L.minX, L.maxY - L.minY),
						Y.id,
						this.parent.zoomController.currentSnapRange(),
						Consts.I_AM_A_CLONE
					);
				if (N.point !== null) {
					const xe = new MouseInfo(
						N.point.x - (Y.translation.x + S.x),
						N.point.y - (Y.translation.y + S.y)
					);
					(c.point = MouseInfo.componentAdd(e, xe)),
						(c.edges += N.edges),
						(c.snappedSnaps = c.snappedSnaps.concat(N.snappedSnaps));
				}
			}
		for (let C = 0, A = this.snaps.length; C < A; C++)
			this.snaps[C].isSelfSnap(u) ||
				((o = this.snaps[C].snaps(u.getParentPartName(), e, t, i)),
					o !== null &&
					(c.point === o.point
						? c.snappedSnaps.push(this.snaps[C])
						: c.snappedSnaps.length === 0
							? (c.snappedSnaps.push(this.snaps[C]), (c.point = o.point))
							: ((a = UtilityPainter.combineSnaps(
								c.snappedSnaps,
								o.point,
								e,
								t,
								this.snaps[C],
								i
							)),
								(c.snappedSnaps = a.snappedSnaps),
								a.point !== null && (c.point = a.point))));
		if (!s)
			for (let C = 0, A = c.snappedSnaps.length; C < A; C++)
				c.snappedSnaps[C].snappedBy.push(n),
					(c.edges += c.snappedSnaps[C].forEdge);
		return c;
	}
	static combineSnaps(e, t, n, i, s, o) {
		let a, c, u;
		const S = { point: null, snappedSnaps: e },
			v = Consts.SNAP_EDGE_PRIO[s.forEdge];
		if (e.length === 1) {
			(a = UtilityPainter.intersectSnaps(s, e[0])),
				(c = e[0].forEdge + s.forEdge),
				(u = UtilityPainter.centerCoordinateToEdge(n, i, c));
			for (let C = 0, A = a.length; C < A; C++)
				if (F.vectorLength2D(a[C], u) < o)
					return (
						(S.point = UtilityPainter.edgeCoordinateToCenter(a[C], i, c)),
						Consts.SNAP_EDGE_PRIO[e[0].forEdge] < v ? e.push(s) : e.splice(0, 0, s),
						S
					);
			return (
				Consts.SNAP_EDGE_PRIO[e[0].forEdge] < v ? (S.point = t) : (S.point = null), S
			);
		}
		if (v <= Consts.SNAP_EDGE_PRIO[e[1].forEdge]) return (S.point = null), S;
		if (v > Consts.SNAP_EDGE_PRIO[e[0].forEdge]) {
			(a = UtilityPainter.intersectSnaps(s, e[0])),
				(c = e[0].forEdge + s.forEdge),
				(u = UtilityPainter.centerCoordinateToEdge(n, i, c));
			for (let C = 0; C < a.length; C++)
				if (F.vectorLength2D(u, a[C]) < o)
					return (
						(S.point = UtilityPainter.edgeCoordinateToCenter(a[C], i, c)),
						e.pop(),
						e.splice(0, 0, s),
						S
					);
			(a = UtilityPainter.intersectSnaps(s, e[1])),
				(c = e[1].forEdge + s.forEdge),
				(u = UtilityPainter.centerCoordinateToEdge(n, i, c));
			for (let C = 0; C < a.length; C++)
				if (F.vectorLength2D(u, a[C]) < o)
					return (
						(S.point = UtilityPainter.edgeCoordinateToCenter(a[C], i, c)), (e[0] = s), S
					);
			return (S.point = t), S;
		}
		(a = UtilityPainter.intersectSnaps(s, e[0])),
			(c = e[0].forEdge + s.forEdge),
			(u = UtilityPainter.centerCoordinateToEdge(n, i, c));
		for (let C = 0; C < a.length; C++)
			if (F.vectorLength2D(u, a[C]) < o)
				return (S.point = UtilityPainter.edgeCoordinateToCenter(a[C], i, c)), (e[1] = s), S;
		return (S.point = null), S;
	}
	static intersectSnaps(e, t) {
		const n = [];
		for (let i = 1; i < e.points.length; i++)
			for (let s = 1; s < t.points.length; s++) {
				const o = F.checkLineIntersection(
					e.points[i - 1],
					e.points[i],
					t.points[s - 1],
					t.points[s]
				);
				o.onLine1 && o.onLine2 && n.push(new MouseInfo(o.x, o.y));
			}
		return n;
	}
	setGreyOutStateOnPartsConnectedByPortalline(e, t) {
		for (let n = 0, i = this.parent.portalLines.length; n < i; n++)
			this.parent.portalLines[n].presentOnPart(e) &&
				this.parent.modelParts[
					this.parent.portalLines[n].getComplimentaryPart(e)
				].setGreyOutState(t);
	}
	greyOutInactiveParts() {
		this.greyoutAllModelParts();
		const e = this.parent.selectedObject.getParent();
		e.setGreyOutState(Se.OUT_OF_DRUCKBEREICH_GREYED_OUT),
			this.setGreyOutStateOnPartsConnectedByPortalline(
				e.name,
				Se.OUT_OF_DRUCKBEREICH_GREYED_OUT
			),
			this.parent.render();
	}
	greyoutAllModelParts() {
		for (const e in this.parent.modelParts)
			this.parent.modelParts[e].setGreyOutState(Se.GREYED_OUT);
	}
	liftGreyout() {
		for (const e in this.parent.modelParts)
			this.parent.modelParts[e].setGreyOutState(Se.NOT_GREYED_OUT);
		this.parent.render();
	}
	setNonEmptyLayersVisibleAndToHandleShader() {
		for (let e = 0; e < this.nonEmptyLayers.length; e++) {
			const t = this.nonEmptyLayers[e].parent;
			if (t.visible) {
				const n = t.mesh;
				(n.visible = !0), (n.material = t.handleShader);
			}
		}
	}
	static centerCoordinateToEdge(e, t, n) {
		const i = new MouseInfo(e.x, e.y);
		return (
			n.indexOf("right") > -1 && (i.x += t.width / 2),
			n.indexOf("left") > -1 && (i.x -= t.width / 2),
			n.indexOf("bottom") > -1 && (i.y += t.height / 2),
			n.indexOf("top") > -1 && (i.y -= t.height / 2),
			i
		);
	}
	static edgeCoordinateToCenter(e, t, n) {
		const i = new MouseInfo(e.x, e.y);
		return (
			n.indexOf("right") > -1 && (i.x -= t.width / 2),
			n.indexOf("left") > -1 && (i.x += t.width / 2),
			n.indexOf("bottom") > -1 && (i.y -= t.height / 2),
			n.indexOf("top") > -1 && (i.y += t.height / 2),
			i.apply(Math.round)
		);
	}
}


class ObjectPart {
	constructor(e, t, n) {
		(this.selectableObjects = []),
			(this.hitmapContext2D = null),
			(this.handles = []),
			(this.hitmapImageData = null),
			(this.isGreyedOut = Se.NOT_GREYED_OUT),
			(this.owayoMaterial = { stoff: null, colorCode: null }),
			(this.sperrBezirke = []),
			(this.hasZentralesAbgelegtesNichtEinfaerbbaresPartImage = !0),
			(this.visible = !0),
			(this.map = null),
			(this.alphaMap = null),
			(this.specularMap = null),
			(this.bumpMap = null),
			(this.normalMap = null),
			(this.shadowMap = null),
			(this.overlayMap = null),
			(this.overlayIntensity = 1),
			(this.overlayScale = { x: 1, y: 1 }),
			(this.overlayHelligkeitsSummand = -0.5),
			(this.overlayAnzeigenAufFarbenIntArray = []),
			(this.bumpScale = 0),
			(this.normalScale = 0),
			(this.shininess = 0),
			(this.specularMin = 0),
			(this.specular = 0),
			(this.colorCanvas = null),
			(this.partStauchungsFaktor = 1),
			(this.shaders = []),
			(this.shadowCanvas = null),
			(this.druckBereich = null),
			(this.nichtDruckBereich = null),
			(this.motivBereich = null),
			(this.isDroppableLegacyFromStoff = !1),
			(this.innenseiteAufhellen = !0),
			(this.schwarzAufhellenImDruckbereich = !1),
			(this.hasDefinedDruckbereich = () => this.druckBereich !== null),
			(this.parent = e),
			(this.name = t.name),
			(this.mesh = t),
			(this.zOrderTable = n),
			this.initColorTextur(),
			(this.textureSize = new MouseInfo(0, 0)),
			(this.partSizeCM = new MouseInfo(0, 0)),
			this.initHitMapCanvas(),
			(this.patternAnker = new MouseInfo(0, 0)),
			(this.pendingTasks = new TaskCounter(
				this,
				null,
				() => this.pendingTasksComplete(),
				"OwayoKonfiPart Constructor"
			)),
			(this.handleAndGuideLayer = new GuideLayer(this)),
			(this.handleShader = HandleShader.createHandleShader(this)),
			(this.offsetRepeat = new THREE.Vector4(0, 0, 1, 1));
	}
	initColorTextur() {
		(this.colorCanvas = document.createElement("canvas")),
			(this.colorTexture = new THREE.Texture()),
			(this.colorTexture.minFilter = THREE.NearestFilter),
			(this.colorTexture.magFilter = THREE.NearestFilter),
			(this.colorTexture.generateMipmaps = !1);
	}
	initHitMapCanvas() {
		(this.hitmapCanvas = document.createElement("canvas")),
			(this.hitmapCanvas.width = Consts.HITMAP_SIZE.width),
			(this.hitmapCanvas.height = Consts.HITMAP_SIZE.height),
			(this.hitmapContext2D = this.hitmapCanvas.getContext("2d", {
				willReadFrequently: !0,
			}));
	}
	pendingTasksComplete() {
		this.parent.selectedObject !== null &&
			this.parent.selectedObject.getParentPartName() === this.name &&
			this.parent.selectedObject.placeAppropriateHandles();
		const e = this.parent.entangledObjects;
		for (let t = 0, n = e.length; t < n; t++)
			e[t].getParentPartName() === this.name && e[t].placeAppropriateHandles();
		this.parent.utilityPainter.repaint(),
			z.createShaders(this, this.parent.getPatterns(this.name)),
			this.parent.render();
	}
	static groupIsInFaceUV(e, t, n, i) {
		let s;
		for (let o = t, a = (t + n) / 3; o < a; o += 1)
			if (((s = li(e, o, i)), s.isUVInFace)) return s;
		return s;
	}
	getISUVCoordinateInFaceUVFromIndexedGeometry(e, t) {
		let n;
		const i = e.index.array;
		let s = e.groups;
		s.length === 0 && (s = [{ start: 0, count: i.length, index: 0 }]);
		for (let o = 0, a = s.length; o < a; ++o)
			if (
				((n = ObjectPart.groupIsInFaceUV(this.mesh, s[o].start, s[o].count, t)),
					n.isUVInFace)
			)
				return n;
		return n;
	}
	getObject3DCoordinateOfUV(e, t) {
		const n = { isUVInFace: !1, coordinateOnObject: new THREE.Vector3(0) };
		let i;
		e || Pe("no UV coordinate"), (t = t || !1);
		const s = this.mesh.geometry;
		if (!(s instanceof THREE.BufferGeometry))
			return (
				console.error(
					"error in getObject3DCoordinateOfUV: Geometry-Type not yet supported"
				),
				n
			);
		const o = s.attributes;
		if (s.index) i = this.getISUVCoordinateInFaceUVFromIndexedGeometry(s, e);
		else
			for (
				let a = 0, c = o.position.array.length / 9;
				a < c && ((i = li(this.mesh, a, e)), !i.isUVInFace);
				a += 1
			);
		return (
			i.isUVInFace,
			(n.isUVInFace = i.isUVInFace),
			i.isUVInFace &&
			(n.coordinateOnObject.set(
				i.coordinateOnObject.x,
				i.coordinateOnObject.y,
				i.coordinateOnObject.z
			),
				t && n.coordinateOnObject.applyMatrix4(this.mesh.matrixWorld)),
			n
		);
	}
	static getHitmapPixelNumber(e, t, n) {
		return t * n * Consts.HITMAP_BYTES_PER_PIXEL + e * Consts.HITMAP_BYTES_PER_PIXEL;
	}
	getHitColorCodeInHitmapFromUV(e, t) {
		const n = Math.round(e * this.hitmapCanvas.width),
			i = this.hitmapCanvas.height - Math.round(t * this.hitmapCanvas.height),
			s = ObjectPart.getHitmapPixelNumber(n, i, this.hitmapCanvas.width);
		return this.hitmapImageData.data[s];
	}
	getHitColorCode(e) {
		if (this.hitmapImageData === null) return null;
		const t = this.getHitColorCodeInHitmapFromUV(e.u, e.v);
		return this.parent.colorCodes.reduce(function (n, i) {
			return i.colorCodeNr === t
				? (ViewerFeature.LOG_HIT_PARTS_in_CONSOLE &&
					console.log("hit colorcode: " + i.colorCode),
					i.colorCode)
				: n;
		}, null);
	}
	getHitSelectableObjectID(e) {
		if (this.parent.selectedObject === null) return null;
		if (this.parent.selectedObject.covers(this.name, e))
			return this.parent.selectedObject.id;
		for (let t = 0, n = this.parent.entangledObjects.length; t < n; t++)
			if (this.parent.entangledObjects[t].covers(this.name, e))
				return this.parent.entangledObjects[t].id;
		return null;
	}
	getHitObjectAndColor(e) {
		const t = {
			colorCode: this.getHitColorCode(e),
			selectableObjectID: null,
			hitHandler: null,
		},
			n = this.handleIdUnderPosition(e);
		if (n !== null) return (t.hitHandler = n), t;
		if (this.parent.selectedObject !== null) {
			const o = this.getHitSelectableObjectID(e);
			if (o !== null) return (t.selectableObjectID = o), t;
		}
		const i = this.selectableObjectUnderPosition(e);
		if (i !== null) return (t.selectableObjectID = i), t;
		const s = this.getHitPatternSelOb(t.colorCode);
		return s !== null && (t.selectableObjectID = s), t;
	}
	selectableObjectUnderPosition(e) {
		const t = this;
		return this.selectableObjects.reduce(
			function (n, i) {
				if (i.covers(t.name, e)) {
					const s = t.zOrderTable.getZIndex(i.id),
						o = (u) => n.isPinned === !0 && u.isPinned === !1,
						a = (u, S) =>
							n.isPinned === !0 && u.isPinned === !0 && S > n.zOrder,
						c = (u, S) =>
							n.isPinned === !1 && u.isPinned === !1 && S > n.zOrder;
					o(i) && ((n.isPinned = !1), (n.zOrder = s), (n.id = i.id)),
						a(i, s) && ((n.zOrder = s), (n.id = i.id)),
						c(i, s) && ((n.zOrder = s), (n.id = i.id));
				}
				return n;
			},
			{ id: null, zOrder: -1 / 0, isPinned: !0 }
		).id;
	}
	handleIdUnderPosition(e) {
		return this.handles.reduce(function (t, n) {
			return t !== null ? t : n.covers(e) ? n.id : null;
		}, null);
	}
	setGreyOutState(e) {
		this.isGreyedOut !== e &&
			((this.isGreyedOut = e),
				(this.shaders[0].uniforms.isGreyedOut.value =
					e === Se.GREYED_OUT ? 1 : 0),
				(this.shaders[0].uniforms.isGreyedOutExceptDruckbereich.value =
					e === Se.OUT_OF_DRUCKBEREICH_GREYED_OUT ? 1 : 0));
	}
	orderSelObsByZIndex() {
		const e = this.selectableObjects.slice(0);
		this.selectableObjects.sort(function (t, n) {
			return t.zIndex() - n.zIndex();
		});
		for (let t = 0, n = this.selectableObjects.length; t < n; t++)
			if (e[t] !== this.selectableObjects[t]) return !0;
		return !1;
	}
	insertPartSelOb(e) {
		this.selectableObjects.push(e),
			(this.selectableObjects = this.selectableObjects.sort(function (t, n) {
				return t.zIndex() - n.zIndex();
			}));
	}
	getCounterpart() {
		if (this.name.indexOf("_optional") > -1) return null;
		const e = [
			{ s: /Left/i, r: "Right" },
			{ s: /Right/i, r: "Left" },
			{ s: /Links/i, r: "Rechts" },
			{ s: /Rechts/i, r: "Links" },
		],
			t = this;
		return e.reduce(function (n, i) {
			if (n !== null) return n;
			const s = t.name.replace(i.s, i.r);
			return s !== t.name && (n = Sn(t.parent.modelParts, s)), n;
		}, null);
	}
	getHitPatternSelOb(e) {
		const t = te(this.selectableObjects, "repeat", !0);
		return t !== null &&
			(t.clampToColor === -1 ||
				e === String.fromCharCode(t.clampToColor + Consts.KEYCODE.A - 1))
			? t.id
			: null;
	}
	setVisibility(e) {
		(this.mesh.visible = e), (this.visible = e);
	}
	disposeShaders() {
		for (let e = 0; e < this.shaders.length; e++) this.shaders[e].dispose();
	}
	disposeMesh() {
		this.mesh !== null &&
			(this.mesh.geometry && this.mesh.geometry.dispose(),
				this.mesh.material && this.mesh.material.dispose(),
				(this.mesh = null));
	}
	disposeHandleAndGuideLayer() {
		(this.handleAndGuideLayer.textureCanvas = null),
			(this.handleAndGuideLayer.textureContext2D = null),
			this.handleAndGuideLayer.texture.dispose(),
			(this.handleAndGuideLayer.texture = null);
	}
	dispose() {
		const e = Oi(ObjectPart.isNullOrUndefined),
			t = (n) => {
				e(this[n]) && (this[n].dispose(), (this[n] = null));
			};
		this.disposeShaders(),
			(this.colorCanvas = null),
			this.colorTexture.dispose(),
			(this.hitmapCanvas = null),
			this.disposeMesh(),
			t("handleShader"),
			t("map"),
			t("shadowMap"),
			e(this.handleAndGuideLayer) && this.disposeHandleAndGuideLayer(),
			(this.alphaMap = null),
			(this.bumpMap = null),
			(this.specularMap = null);
	}
	loadShadowTexture(e) {
		const t = this,
			n = new Image();
		(n.onload = function () {
			(t.shadowMap = new THREE.Texture()),
				(t.shadowMap.minFilter = THREE.NearestFilter),
				(t.shadowMap.magFilter = THREE.NearestFilter),
				(t.shadowMap.generateMipmaps = !1),
				t.textureSize.x < n.width || t.textureSize.y < n.height
					? ((t.shadowCanvas = document.createElement("canvas")),
						t.setShadowCanvasValues(n))
					: (t.shadowMap.image = n),
				(t.shadowMap.needsUpdate = !0),
				z.createShaders(t, t.parent.getPatterns(t.name)),
				t.parent.render(),
				t.parent.viewerTasks.taskFinished("loadColorTexture");
		}),
			(n.onerror = function () {
				rt("could not load part.ShadowTexture"),
					t.parent.viewerTasks.taskFinished("loadColorTexture");
			}),
			(n.src = e);
	}
	setShadowCanvasValues(e) {
		(this.shadowCanvas.width = this.textureSize.x),
			(this.shadowCanvas.height = this.textureSize.y),
			this.shadowCanvas
				.getContext("2d")
				.drawImage(e, 0, 0, this.textureSize.x, this.textureSize.y),
			(this.shadowMap.image = this.shadowCanvas);
	}
	loadPartColor(e, t) {
		const n = this,
			i = new Image();
		(i.onload = function () {
			(n.textureSize.x = i.width),
				(n.textureSize.y = i.height),
				(n.colorTexture.image = i),
				(n.colorTexture.needsUpdate = !0),
				z.createShaders(n, n.parent.getPatterns(n.name)),
				n.parent.render(),
				n.hitmapContext2D.drawImage(
					i,
					0,
					0,
					Consts.HITMAP_SIZE.width,
					Consts.HITMAP_SIZE.height
				),
				(n.hitmapImageData = n.hitmapContext2D.getImageData(
					0,
					0,
					Consts.HITMAP_SIZE.width,
					Consts.HITMAP_SIZE.height
				)),
				n.parent.viewerTasks.taskFinished("loadColorTexture"),
				t.taskFinished();
		}),
			(i.onerror = function () {
				rt("could not load partColorTexture"),
					n.parent.viewerTasks.taskFinished("loadColorTexture");
			}),
			(i.src = e);
	}
}
ObjectPart.isNullOrUndefined = (r) => typeof r > "u" || r === null;

class ZOrderTable {
	constructor() {
		this.values = [];
	}
	clone() {
		const e = new ZOrderTable();
		return (
			(e.values = this.values.map((t) =>
				t.map((n) => new vn(n.id, n.floating))
			)),
			e
		);
	}
	getZIndex(e) {
		let t, n;
		for (t = 0, n = this.values.length; t < n; t++)
			if (typeof this.values[t] < "u" && U(this.values[t], "id", e) > -1)
				return t;
		return -1;
	}
	lowestZIndexThatShouldStayOnTop() {
		let e, t;
		for (e = 0, t = this.values.length; e < t; e++)
			if (ZOrderTable.hasFloatTopEntry(this.values[e])) return e;
		return -1;
	}
	static hasFloatTopEntry(e) {
		let t, n;
		for (t = 0, n = e.length; t < n; t++)
			if (e[t].floating === Consts.FLOAT_TOP) return !0;
		return !1;
	}
	insertEntryIntoZIndex(e, t = Consts.FLOAT_FREE, n, i = !0) {
		typeof n > "u" &&
			(console.warn("zIndex was undefined in insertEntryIntoZIndex"), (n = 0));
		const s = new vn(e, t);
		typeof this.values[n] > "u"
			? ((this.values[n] = [s]), this.fillUpHolesInValues())
			: (((t !== Consts.FLOAT_TOP &&
				ZOrderTable.containsFloatTopEntry(this.values[n]) > -1) ||
				!i) &&
				this.values.splice(n, 0, [s]),
				U(this.values[n], "id", e) === -1 && this.values[n].push(s));
	}
	insertEntry(e, t, n = Consts.FLOAT_FREE) {
		let i;
		const s = new vn(e, n),
			o = this.getZIndexOfClone(t);
		if (o > -1) return this.values[o].push(s), o;
		switch (n) {
			case Consts.FLOAT_TOP:
				return this.values.push([s]), this.values.length - 1;
			case Consts.FLOAT_BOTTOM:
				return this.values.splice(0, 0, [s]), 0;
			default:
				return (
					(i = this.lowestZIndexThatShouldStayOnTop()),
					i > -1
						? (this.values.splice(i, 0, [s]), i)
						: (this.values.push([s]), this.values.length - 1)
				);
		}
	}
	static containsFloatTopEntry(e) {
		return U(e, "floating", Consts.FLOAT_TOP);
	}
	getZIndexOfClone(e) {
		let t, n;
		for (t = 0, n = e.length; t < n; t++) {
			const i = this.getZIndex(e[t]);
			if (i > -1) return i;
		}
		return -1;
	}
	fillUpHolesInValues() {
		let e, t;
		for (e = 0, t = this.values.length; e < t; e++)
			typeof this.values[e] > "u" && (this.values[e] = []);
	}
	deleteEntry(e) {
		let t, n;
		for (t = this.values.length - 1; t > -1; t--)
			if (((n = U(this.values[t], "id", e)), n > -1)) {
				this.values[t].splice(n, 1),
					this.values[t].length === 0 && this.values.splice(t, 1);
				return;
			}
	}
	changeZOrder(e, t) {
		const n = this.values[e];
		this.values.splice(e, 1), this.values.splice(t, 0, n);
	}
	setValues(e) {
		this.values = e;
	}
	hasHoles() {
		let e;
		for (e = this.values.length - 1; e > -1; e--)
			if (typeof this.values[e] > "u" || this.values[e] === null) return !0;
		return !1;
	}
	patchHoles() {
		let e;
		for (e = this.values.length - 1; e > -1; e--)
			(this.values[e] === null || typeof this.values[e] > "u") &&
				this.values.splice(e, 1);
	}
	static getZIndexToChangeTo(e, t, n) {
		return n === "up"
			? ZOrderTable.getNextBiggerZIndex(e, t)
			: ZOrderTable.getNextSmallerZIndex(e, t);
	}
	static getNextSmallerZIndex(e, t) {
		let n,
			i = -1;
		const s = e.length;
		for (n = 0; n < s && e[n] < t; n++) i = n;
		return i;
	}
	static getNextBiggerZIndex(e, t) {
		let n,
			i = -1;
		for (n = e.length - 1; n > -1 && e[n] > t; n--) i = n;
		return i;
	}
}

class TaskCounter {
	constructor(e, t, n, i = "nicht angegeben") {
		(this.context = e),
			(this.pending = 0),
			(this.pendingByTask = []),
			(this.onComplete = n),
			(this.onAdd = t),
			(this.nameOfParent = i || "nicht angegeben");
	}
	taskFinished(e) {
		typeof e > "u" && (e = ""),
			(this.pending -= 1),
			e !== "" &&
			typeof this.pendingByTask[e] < "u" &&
			(this.pendingByTask[e]--,
				this.pending < this.pendingByTask[e] &&
				(console.warn(
					"mismatch between task " +
					e +
					": " +
					this.pendingByTask[e] +
					" and global taskCounter: " +
					this.pending
				),
					(this.pendingByTask[e] = this.pending)),
				this.pendingByTask[e] === 0 &&
				(p.broadcast("taskCounterTaskFinishedEvent", {
					nameOfParent: this.nameOfParent,
					taskName: e,
				}),
					delete this.pendingByTask[e])),
			this.pending < 0 &&
			(console.log(
				"Taskcounter: pendingTask ist " +
				this.pending +
				"; ich gehöre: " +
				this.nameOfParent
			),
				(this.pending = 0)),
			this.pending <= 0 && this.onComplete.call(this.context);
	}
	addTasks(e, t) {
		(this.pending += e),
			typeof this.onAdd == "function" && this.onAdd.call(this.context),
			typeof t < "u" &&
			(typeof this.pendingByTask[t] > "u"
				? (this.pendingByTask[t] = e)
				: (this.pendingByTask[t] += e));
	}
}

class GuideLayer {
	constructor(e) {
		(this.anzMatrices = 0),
			(this.anzVerticalLines = 0),
			(this.anzHorizontalLines = 0),
			(this.anzRectangles = 0),
			(this.matrices = []),
			(this.horizontalLines = []),
			(this.verticalLines = []),
			(this.rectangles = []),
			(this.rectangleColors = []),
			(this.textureCanvas = document.createElement("canvas")),
			(this.textureCanvas.width = e.textureSize.x),
			(this.textureCanvas.height = e.textureSize.y),
			(this.textureContext2D = this.textureCanvas.getContext("2d")),
			(this.texture = new THREE.Texture(this.textureCanvas)),
			(this.texture.minFilter = THREE.LinearFilter),
			(this.texture.generateMipmaps = !1),
			(this.textureSize = new MouseInfo(e.textureSize.x, e.textureSize.y)),
			(this.parent = e),
			this.fillMatrixAndLineArraysWithZeroValues(),
			(this.textureContext2D.strokeStyle = Consts.HELPER_COLOR),
			(this.texture.needsUpdate = !0);
	}
	fillMatrixAndLineArraysWithZeroValues() {
		let e;
		for (
			this.anzMatrices = 0,
			this.anzVerticalLines = 0,
			this.anzHorizontalLines = 0,
			this.anzRectangles = 0,
			this.matrices = [],
			this.horizontalLines = [],
			this.verticalLines = [],
			this.rectangles = [],
			this.rectangleColors = [],
			e = 0;
			e < 8;
			e += 1
		)
			this.rectangles.push(new THREE.Vector4(0, 0, 0, 0)),
				this.verticalLines.push(new THREE.Vector3(0, 0, 0)),
				this.horizontalLines.push(new THREE.Vector3(0, 0, 0)),
				this.matrices.push(new THREE.Matrix3()),
				this.rectangleColors.push(1);
	}
}

class MouseInfo {
	constructor(e = NaN, t = NaN) {
		(this.x = NaN), (this.y = NaN), (this.x = e), (this.y = t);
	}
	apply(e) {
		return new MouseInfo(e(this.x), e(this.y));
	}
	static max(e, t) {
		return new MouseInfo(Math.max(e.x, t.x), Math.max(e.y, t.y));
	}
	static componentAdd(e, t) {
		return new MouseInfo(e.x + t.x, e.y + t.y);
	}
	static componentSubtract(e, t) {
		return new MouseInfo(e.x - t.x, e.y - t.y);
	}
	clone() {
		return new MouseInfo(this.x, this.y);
	}
}
MouseInfo.multiplyComponents = (r, e) => new MouseInfo(r.x * e.x, r.y * e.y);


class HandleShader {
	static createHandleShader(e, t = null) {
		const n = [],
			i = [],
			s = [];
		e.handles.forEach(function (c, u) {
			n.push(new THREE.Vector2(c.translation.x, c.translation.y)),
				i.push(c.iconIndizes[c.status]),
				s.push($t.getHandleShaderSource(u));
		}),
			s.push($t.returnIfHandleHit());
		const o = HandleShader.getHandleShaderUniforms(
			e.handleAndGuideLayer,
			e.parent.handleTexture,
			i,
			n,
			e.parent.utilityPainter.fadingAlpha
		),
			a = HandleShader.getHandleFragmentShader(e, s, t);
		return new THREE.ShaderMaterial({
			vertexShader: ls.join(`
`),
			uniforms: o,
			fragmentShader: a.join(`
`),
			transparent: !0,
			lights: !1,
			side: THREE.FrontSide,
		});
	}
	static getHandleShaderUniforms(e, t, n, i, s) {
		return {
			handleTexture: { type: "tv", value: [t] },
			handleIconIndex: { type: "fv1", value: n },
			handleTranslation: { type: "v2v", value: i },
			textureAlpha: { type: "f", value: s },
			anzMatrices: { type: "i", value: e.anzMatrices },
			matrices: { type: "m3v", value: e.matrices },
			anzRectangles: { type: "i", value: e.anzRectangles },
			rectangles: { type: "v4v", value: e.rectangles },
			rectangleColors: { type: "fv1", value: e.rectangleColors },
			anzVerticalLines: { type: "i", value: e.anzVerticalLines },
			anzHorizontalLines: { type: "i", value: e.anzHorizontalLines },
			horizontalLines: { type: "v3v", value: e.horizontalLines },
			verticalLines: { type: "v3v", value: e.verticalLines },
		};
	}
	static getHandleFragmentShader(e, t, n = null) {
		if (n !== null) return [n];
		{
			const i = e.parent.handleTexture.image;
			return [
				"#define AnzHandles " + e.handles.length,
				"varying vec2 vUv;",
				"uniform sampler2D handleTexture[1];",
				"uniform float     textureAlpha;",
				"uniform int anzVerticalLines;",
				"uniform int anzHorizontalLines;",
				"uniform int anzRectangles;",
				"uniform int anzMatrices;",
				"uniform mat3 matrices[8];",
				"uniform vec3 horizontalLines[5];",
				"uniform vec3 verticalLines[5];",
				"uniform vec4 rectangles[8];",
				"uniform float rectangleColors[8];",
				"const vec4 standardHelperColor = vec4(0.8, 0.8, 0.8, 1.0);",
				"const vec4 warningHelperColor = vec4(1.0, 0.2, 0.2, 1.0);",
				"const float helperLinesThickness = " + Consts.HELPER_LINEWIDTH + ".0;",
				"const vec2  TextureGesamtGroesse = vec2(" +
				e.textureSize.x +
				"," +
				e.textureSize.y +
				");",
				"const vec2  handleTextureSize    = vec2(" +
				i.width +
				"," +
				i.height +
				");   ",
				"const vec2  handleIconSize       = vec2(" +
				Consts.HANDLER_WIDTH +
				"," +
				Consts.HANDLER_HEIGHT +
				");   ",
				"const float inversePartStauchungsfaktor = " +
				(1 / e.partStauchungsFaktor).toFixed(5) +
				";",
				e.handles.length > 0
					? [
						"  uniform vec2      handleTranslation[AnzHandles];",
						"  uniform float     handleIconIndex[AnzHandles];",
					].join(`
`)
					: "",
				as.join(`
`),
				"void main(void) {",
				"  vec2 mProd;",
				"  vec2 pixelCoord = TextureGesamtGroesse * vUv;",
				"  vec2 pixelPosInHandle;",
				"  float helperAlpha = 0.0;",
				"  bool  hitHandler = false;",
				"  float showStandardColor = 1.0;",
				"  float hasHitRectangle = 0.0;",
				t.join(`
`),
				"for (int j = 0; j < 5; j++) {",
				"    if (j >= anzHorizontalLines) {break;}",
				"    helperAlpha += isOnStraightLine(pixelCoord.yx, horizontalLines[j], helperLinesThickness);",
				"}",
				"for (int j = 0; j < 5; j++) {",
				"    if (j >= anzVerticalLines) {break;}",
				"    helperAlpha += isOnStraightLine(pixelCoord, verticalLines[j], helperLinesThickness);",
				"}",
				"for (int j = 0; j < 8; j ++) {",
				"    if (anzRectangles <= j) {break;}",
				"    hasHitRectangle = ",
				"    isOnStraightLine(pixelCoord.yx, rectangles[j].yxz, helperLinesThickness)",
				"                + isOnStraightLine(pixelCoord.yx, rectangles[j].wxz, helperLinesThickness)",
				"                + isOnStraightLine(pixelCoord, rectangles[j].xwy, helperLinesThickness)",
				"                + isOnStraightLine(pixelCoord, rectangles[j].zwy, helperLinesThickness);",
				"    helperAlpha += hasHitRectangle;",
				"    showStandardColor -= (hasHitRectangle * rectangleColors[j]);",
				"}",
				"for(int j = 0; j < 8; j++ ) {",
				"    if (j >= anzMatrices){break;}",
				"    mProd = (matrices[j] * vec3(pixelCoord, 1.0)).xy;",
				"    helperAlpha += step(abs(mProd.x), 1.0) * step(abs(mProd.y), 1.0);",
				"}",
				"gl_FragColor = standardHelperColor * vec4( 1.0, showStandardColor, showStandardColor, textureAlpha * helperAlpha);",
				"}",
			];
		}
	}
}


function Me(r, ...e) {
	return function (...t) {
		return r(...e, ...t);
	};
}
function ve(r, ...e) {
	return function (...t) {
		return r(...t, ...e);
	};
}
function ge(...r) {
	return function (...e) {
		if (r.length === 0) return;
		let t = r[r.length - 1](...e);
		for (let n = r.length - 2; n > -1; n--) t = r[n](t);
		return t;
	};
}
function ke(r) {
	return function (...e) {
		return r.length <= e.length ? r(...e) : Me(r, ...e);
	};
}
class be { }
be.join = ke((r, e, ...t) =>
	["string", "number"].indexOf(typeof e) > -1
		? [e].concat(t).join(r)
		: typeof e > "u" || e === null
			? ""
			: e.concat(t).join(r)
);
be.sentence = be.join(" ");
be.list = be.join(", ");
be.joinarguments = (
	r,
	e,
	t = `
`
) => [r].concat(e).join(t);
be.append = ke((r, e) => (e || "") + r);
be.prepend = ke((r, e) => r + (e || ""));
be.brace = ke((r, e, t) => e + r + t);
be.roundbracket = ve(be.brace, "(", ")");
be.squarebracket = ve(be.brace, "[", "]");

class E extends be { }
E.endline = `;
`;
E.funcWriter = ke((r, e, ...t) =>
	E.prepend(r, E.roundbracket(E.joinarguments(e, t, ", ")))
);
E.nthArrayEntry = ke((r, e) => E.append(E.squarebracket(r), e));
E.bracketArgs = (...r) => r.map((e) => E.roundbracket(e));
E.prop = E.brace(".");
E.add = E.join(" + ");
E.subtract = E.join(" - ");
E.divide = ge(E.join(" / "), E.bracketArgs);
E.times = ge(E.join(" * "), E.bracketArgs);
E.squarebracket = ve(E.brace, "[", "]");
E.define = ge(ve(E.brace, E.endline), E.join(" "));
E.uniform = ge(E.prepend("uniform "), E.define);
E.varying = ge(E.brace, "varying ", E.endline);
E.or = E.join(" || ");
E.and = E.join(" && ");
E.for = (r, e) => (t) =>
	"for(int i=" + r + "; i < " + e + "; i++){" + t + "}" + E.endline;
E.assign = ge(
	E.append(`;
`),
	E.brace(" = ")
);
E.compare = (r, e, t) => E.brace(t, r, e);
E.lessThan = E.brace(" < ");
E.lessOrEqualThan = E.brace(" <= ");
E.greaterThan = E.brace(" > ");
E.greaterOrEqualThan = E.brace(" >= ");
E.equal = E.brace(" == ");
E.notEqual = E.brace(" != ");
E.not = E.prepend("!");
E.allComponentsLessThan = (r, e, t) =>
	E.and(e.map((n) => E.lessThan(E.prop(r, n), t)));
E.if = ke(function (r, e, ...t) {
	return E.brace(
		E.roundbracket(r),
		"if ",
		E.brace(
			E.joinarguments(e, t),
			` {
`,
			`}
`
		)
	);
});
E.else = ge(
	ve(
		E.brace,
		` else {
`,
		`
}
`
	),
	(...r) =>
		r.join(`
`)
);
E.x = ve(E.prop, "x");
E.y = ve(E.prop, "y");
E.vec2 = E.funcWriter("vec2");
E.vec3 = E.funcWriter("vec3");
E.abs = E.funcWriter("abs");
E.texture2D = E.funcWriter("texture2D");
E.mod = E.funcWriter("mod");
E.clamp = E.funcWriter("clamp");
E.defineVar = ke((r, e, t) => E.join(" ", r, E.assign(e, t)));
E.defineBoolvar = E.defineVar("bool");
E.defineVec3var = E.defineVar("vec3");
E.getDimFunction = (r) => (r === "x" ? E.x : E.y);

class $t extends E {
	static getHandleShaderSource(e) {
		const t = $t,
			n = t.nthArrayEntry(e);
		return [
			t.assign(
				t.x("pixelPosInHandle"),
				t.times(
					t.subtract(t.x("pixelCoord"), t.x(n("handleTranslation"))),
					"inversePartStauchungsfaktor"
				)
			),
			t.assign(
				t.y("pixelPosInHandle"),
				t.subtract(t.y("pixelCoord"), t.y(n("handleTranslation")))
			),
			t.assign(
				"pixelPosInHandle",
				t.add("pixelPosInHandle", t.times("handleIconSize", "0.5"))
			),
			t.if(
				t.equal(
					t.clamp("pixelPosInHandle", t.vec2("0.0"), "handleIconSize"),
					"pixelPosInHandle"
				)
			)(
				t.brace(
					"+=",
					t.x("pixelPosInHandle"),
					t.times(n("handleIconIndex"), t.x("handleIconSize"))
				) + t.endline,
				t.assign(
					"gl_FragColor",
					t.texture2D(
						t.nthArrayEntry(0, "handleTexture"),
						t.divide("pixelPosInHandle", "handleTextureSize")
					)
				),
				t.assign("hitHandler", "true")
			),
		].join("");
	}
	static returnIfHandleHit() {
		const e = $t;
		return e.if(e.equal("hitHandler", "true"))(`return;
`);
	}
}



document.addEventListener("DOMContentLoaded", async function () {
	console.log("DOM fully loaded and parsed");
	console.log("THREE", THREE);

	const viewerEl = document.getElementById("3DViewer");

	const viewer = new Viewer(viewerEl);
	viewer.init().loadModel();

	console.log('DONE');
});
