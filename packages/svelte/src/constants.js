export const EACH_ITEM_REACTIVE = 1;
export const EACH_INDEX_REACTIVE = 1 << 1;
export const EACH_KEYED = 1 << 2;

/** See EachBlock interface metadata.is_controlled for an explanation what this is */
export const EACH_IS_CONTROLLED = 1 << 3;
export const EACH_IS_ANIMATED = 1 << 4;
export const EACH_IS_STRICT_EQUALS = 1 << 6;

export const PROPS_IS_IMMUTABLE = 1;
export const PROPS_IS_RUNES = 1 << 1;
export const PROPS_IS_UPDATED = 1 << 2;
export const PROPS_IS_LAZY_INITIAL = 1 << 3;

export const TRANSITION_IN = 1;
export const TRANSITION_OUT = 1 << 1;
export const TRANSITION_GLOBAL = 1 << 2;

export const TEMPLATE_FRAGMENT = 1;
export const TEMPLATE_USE_IMPORT_NODE = 1 << 1;

export const HYDRATION_START = '[';
/** used to indicate that an `{:else}...` block was rendered */
export const HYDRATION_START_ELSE = '[!';
export const HYDRATION_END = ']';
export const HYDRATION_ERROR = {};

export const ELEMENT_IS_NAMESPACED = 1;
export const ELEMENT_PRESERVE_ATTRIBUTE_CASE = 1 << 1;

export const UNINITIALIZED = Symbol();

// Dev-time component properties
export const FILENAME = Symbol('filename');
export const HMR = Symbol('hmr');

/** List of elements that require raw contents and should not have SSR comments put in them */
export const RawTextElements = ['textarea', 'script', 'style', 'title'];

/** List of Element events that will be delegated */
export const DelegatedEvents = [
	'beforeinput',
	'click',
	'change',
	'dblclick',
	'contextmenu',
	'focusin',
	'focusout',
	'input',
	'keydown',
	'keyup',
	'mousedown',
	'mousemove',
	'mouseout',
	'mouseover',
	'mouseup',
	'pointerdown',
	'pointermove',
	'pointerout',
	'pointerover',
	'pointerup',
	'touchend',
	'touchmove',
	'touchstart'
];

/** List of Element events that will be delegated and are passive */
export const PassiveDelegatedEvents = ['touchstart', 'touchmove', 'touchend'];

/**
 * @type {Record<string, string>}
 * List of attribute names that should be aliased to their property names
 * because they behave differently between setting them as an attribute and
 * setting them as a property.
 */
export const AttributeAliases = {
	// no `class: 'className'` because we handle that separately
	formnovalidate: 'formNoValidate',
	ismap: 'isMap',
	nomodule: 'noModule',
	playsinline: 'playsInline',
	readonly: 'readOnly'
};

/**
 * Attributes that are boolean, i.e. they are present or not present.
 */
export const DOMBooleanAttributes = [
	'allowfullscreen',
	'async',
	'autofocus',
	'autoplay',
	'checked',
	'controls',
	'default',
	'disabled',
	'formnovalidate',
	'hidden',
	'indeterminate',
	'ismap',
	'loop',
	'multiple',
	'muted',
	'nomodule',
	'novalidate',
	'open',
	'playsinline',
	'readonly',
	'required',
	'reversed',
	'seamless',
	'selected',
	'webkitdirectory'
];

export const namespace_svg = 'http://www.w3.org/2000/svg';
export const namespace_mathml = 'http://www.w3.org/1998/Math/MathML';

/**
 * @param {string} name
 * @param {"include-on" | "exclude-on"} [mode] - wether if name starts with `on` or `on` is excluded at this point
 */
export function is_capture_event(name, mode = 'exclude-on') {
	if (!name.endsWith('capture')) {
		return false;
	}
	return mode == 'exclude-on'
		? name !== 'gotpointercapture' && name !== 'lostpointercapture'
		: name !== 'ongotpointercapture' && name !== 'onlostpointercapture';
}

export const reserved = [
	'arguments',
	'await',
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'enum',
	'eval',
	'export',
	'extends',
	'false',
	'finally',
	'for',
	'function',
	'if',
	'implements',
	'import',
	'in',
	'instanceof',
	'interface',
	'let',
	'new',
	'null',
	'package',
	'private',
	'protected',
	'public',
	'return',
	'static',
	'super',
	'switch',
	'this',
	'throw',
	'true',
	'try',
	'typeof',
	'var',
	'void',
	'while',
	'with',
	'yield'
];

const void_element_names = [
	'area',
	'base',
	'br',
	'col',
	'command',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
];

// we use a list of ignorable runtime warnings because not every runtime warning
// can be ignored and we want to keep the validation for svelte-ignore in place
export const IGNORABLE_RUNTIME_WARNINGS = /** @type {const} */ ([
	'state_snapshot_uncloneable',
	'binding_property_non_reactive',
	'hydration_attribute_changed',
	'hydration_html_changed',
	'ownership_invalid_binding',
	'ownership_invalid_mutation'
]);

/** @param {string} name */
export function is_void(name) {
	return void_element_names.includes(name) || name.toLowerCase() === '!doctype';
}
