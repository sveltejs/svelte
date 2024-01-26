export const EACH_ITEM_REACTIVE = 1;
export const EACH_INDEX_REACTIVE = 1 << 1;
export const EACH_KEYED = 1 << 2;
export const EACH_PROXIED = 1 << 3;
/** See EachBlock interface metadata.is_controlled for an explanation what this is */
export const EACH_IS_CONTROLLED = 1 << 3;
export const EACH_IS_ANIMATED = 1 << 4;
export const EACH_IS_IMMUTABLE = 1 << 6;

export const PROPS_IS_IMMUTABLE = 1;
export const PROPS_IS_RUNES = 1 << 1;
export const PROPS_IS_UPDATED = 1 << 2;
export const PROPS_IS_LAZY_INITIAL = 1 << 3;

/** List of Element events that will be delegated */
export const DelegatedEvents = [
	'beforeinput',
	'click',
	'dblclick',
	'contextmenu',
	'focusin',
	'focusout',
	// 'input', This conflicts with bind:input
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
	'selected'
];

export const namespace_svg = 'http://www.w3.org/2000/svg';
export const namespace_html = 'http://www.w3.org/1999/xhtml';
