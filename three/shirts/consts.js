const config = {
	DEVICE_PIXEL_RATIO: 1.2,
	RENDER_PARAMS: {
		alpha: !0,
		stencil: !1,
		antialias: !0,
		preserveDrawingBuffer: !0,
	},
	LOWERLIMIT_COLORCODENR_OVER_SELOBS: "190.0",
	I_AM_A_CLONE: !0,
	PERFORMANCE_MAX_TEXTURESIZE: 2048,
	FONT_SIZESTEP: 0.05,
	LOGO_SIZESTEP: 0.05,
	MIN_SCALING: 0.01,
	FLOAT_TOP: 1,
	FLOAT_FREE: 0,
	FLOAT_BOTTOM: -1,
	FLOAT_TOP_AS_STRING: "TOP",
	FLOAT_FREE_AS_STRING: "FREE",
	FLOAT_BOTTOM_AS_STRING: "BOTTOM",
	MAX_BASE_COLORS: 5,
	COLORPICKER_PER_PAGE: 5,
	MAINCOLORCODES: ["A", "B", "C", "D", "E"],
	COLORVALUE_INT_WHITE: 16777215,
	COLORVALUE_INT_BLACK: 0,
	MODEL_PATH: "/static_2/",
	HITMAP_SIZE: { width: 256, height: 256 },
	HITMAP_BYTES_PER_PIXEL: 4,
	ONE_DEGREE: Math.PI / 180,
	SIX_DEGREE: Math.PI / 30,
	MAX_ZOOM: 6,
	MIN_ZOOM: 1,
	CAMERA_STANDARD_FOV: 30,
	TEXTOBJECT_FONTBASESIZE: 120,
	TEXTOBJECT_DEFAULTFONT: "101 Helvetica Neue Medium Conde",
	TEXTOBJECT_OUTLINE_SHAPE: "round",
	INPUT_PROCESSING_DELAY: 500,
	INPUT_PROCESSING_DELAY_LONG: 2e3,
	DEFAULT_TEXT_COLOR: 0,
	HANDLER_WIDTH: 64,
	HANDLER_HEIGHT: 64,
	ANGLE_SNAP: 1,
	ANGLE_ANCHOR_SNAP: 10,
	ANGLE_SNAP_ANCHORS: [-180, -90, 0, 90, 180],
	SNAP_EDGE_PRIO: { left: 1, right: 1, top: 1, bottom: 1, middle: 3, part: 3 },
	BASE_COORD_SNAP: 35,
	SNAP_ZOOM_DECREASE: 6,
	HELPER_FADEOUT_STEPS: 30,
	HELPER_FADEOUT_START: 2e3,
	HELPER_LINEWIDTH: 3,
	HELPER_COLOR: "lightgrey",
	SNAPSHOT_HEIGHT: 350,
	HINT_FADEOUT_START: 5e3,
	BUTTON_REPEAT_INTERVALL: 500,
	CAMERA_MOVE_FPS: 30,
	UNDO_DELAY: 50,
	FPS_LIMIT: 40,
	MOUSE_PS_LIMIT: 80,
	COLORERROR: "FF00FF",
	LOGO_SCHWARZ_AUFHELLEN_TARGET_DECIMALVALUE: 0.16,
	ONLY_USE_ENTWURF_FRONT_PREVIEW: !0,
	MIN_PIXEL_PER_INCH: 100,
	DELTA_E_THRESHHOLD: 20,
	LUMINANCE_THRESHHOLD: 100,
	NEUTRAL_COLOR_DELTA: 10,
	MAX_DRAFTPREVIEW_PICTURES: 4,
	CORNER_INDEX: { LEFT_BOTTOM: 0, RIGHT_BOTTOM: 1, RIGHT_TOP: 2, LEFT_TOP: 3 },
	HINTBOX_TOP_POSITION: 50,
	HINTBOX_BOTTOM_POSITION: 20,
	ROTATEMODEL_ON_BUTTONPRESS: Math.PI / 12,
	KONAMICODE: "38384040373937396665",
	KEYCODE: {
		ESCAPE: 27,
		ENTER: 13,
		RETURN: 13,
		DELETE: 46,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		A: 65,
		B: 66,
		D: 68,
		Y: 89,
		Z: 90,
		NUMPAD0: 96,
		NUMPAD1: 97,
		NUMPAD2: 98,
		NUMPAD3: 99,
		NUMPAD4: 100,
		NUMPAD6: 102,
		NUMPAD7: 103,
		NUMPAD8: 104,
		NUMPAD9: 105,
	},
	DATEFORMAT_BYLANGUAGE: {
		en: "DD. MMM YYYY",
		fr: "DD/MM/YYYY",
		it: "DD/MM/YYYY",
		default: "DD.MM.YYYY",
	},
	NO_RELOAD_NECESSARY: [
		"rotation",
		"relSize",
		"translation",
		"isPinned",
		"isPinned",
		"isFixed",
		"repeat",
		"clampToColor",
		"wasserzeichen",
		"wasserzeichenInvertImage",
		"wasserzeichenIntensity",
		"comment",
		"allowDrag",
		"isEditable",
		"floating",
		"isVorbelegung",
		"allowDrag",
		"allowDelete",
		"allowResize",
		"floating",
		"keepSeparate",
	],
	UPLOAD_ALLOWED_FILETYPES: "png,gif,jpg,jpeg,pdf,bmp,ai,psd,eps,cdr",
	UPLOAD_ALLOWED_FILETYPES_AS_ARRAY: [
		"png",
		"gif",
		"jpg",
		"jpeg",
		"pdf",
		"bmp",
		"ai",
		"psd",
		"eps",
		"cdr",
		"svg",
	],
	UPLOAD_MAXFILESIZE: 10 * 1024 * 1024,
	UPLOAD_ACCEPTFILES: "image/*, .pdf, .psd, .ai, .cdr, .eps, .svg",
	UPLOAD_ACCEPTFILES_AS_ARRAY: [
		"image/*",
		".pdf",
		".psd",
		".ai",
		".cdr",
		".eps",
	],
	UPLOAD_CONVERTABLEFORMATS: ["ai", "psd", "cdr", "eps", "pdf"],
	VECTOR_GRAPHICS_EXTENSIONS: ["svg", "wmf", "eps", "pdf", "cdr", "ai"],
	LOGOSLIDER_COLUMSPERROW: 4,
	LOGOSLIDER_ROWSPERPAGE: 3,
	EXEMPLARLIST_MAX_ANZ_EXEMPLARE: 250,
	WARNING_SPERRBEZIRK: "WARNING_SPERRBEZIRK",
	WARNING_ILLEGAL_COLLISION: "WARNING_ILLEGALCOLLISION",
	BYTES_PER_PIXEL: 4,
	TRANSPARENCYBIT_OFFSET: 3,
	LAENDER_WHERE_LAND_IST_LANGUAGE_ISO: ["au", "nz", "ca", "ie"],
	ENTWURF_DELETE_ANIMATION_TIMEOUT: 1e3,
	CHROMOLOGOCANVASWIDTH: 1024,
	RICHTUNGSTASTEN: [],
	DOMAIN_LANDESSPRACHE_MAP: {},
};
config.RICHTUNGSTASTEN = [
	config.KEYCODE.LEFT,
	config.KEYCODE.RIGHT,
	config.KEYCODE.UP,
	config.KEYCODE.DOWN,
];
export default config;