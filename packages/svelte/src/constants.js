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
export const HYDRATION_END = ']';
export const HYDRATION_END_ELSE = `${HYDRATION_END}!`; // used to indicate that an `{:else}...` block was rendered
export const HYDRATION_ERROR = {};

export const ELEMENT_IS_NAMESPACED = 1;
export const ELEMENT_PRESERVE_ATTRIBUTE_CASE = 1 << 1;

export const UNINITIALIZED = Symbol();

/** List of elements that require raw contents and should not have SSR comments put in them */
export const RawTextElements = ['textarea', 'script', 'style', 'title'];

/** List of Element events that will be delegated */
export const DelegatedEvents = [
	'beforeinput',
	'click',
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

// while `input` is also an interactive element, it is never moved by the browser, so we don't need to check for it
export const interactive_elements = new Set([
	'a',
	'button',
	'iframe',
	'embed',
	'select',
	'textarea'
]);

export const disallowed_paragraph_contents = [
	'address',
	'article',
	'aside',
	'blockquote',
	'details',
	'div',
	'dl',
	'fieldset',
	'figcapture',
	'figure',
	'footer',
	'form',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'hr',
	'menu',
	'nav',
	'ol',
	'pre',
	'section',
	'table',
	'ul',
	'p'
];

// https://html.spec.whatwg.org/multipage/syntax.html#generate-implied-end-tags
const implied_end_tags = ['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rp', 'rt'];

/**
 * @param {string} tag
 * @param {string} parent_tag
 * @returns {boolean}
 */
export function is_tag_valid_with_parent(tag, parent_tag) {
	// First, let's check if we're in an unusual parsing mode...
	switch (parent_tag) {
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inselect
		case 'select':
			return (
				tag === 'option' ||
				tag === 'optgroup' ||
				tag === '#text' ||
				tag === 'hr' ||
				tag === 'script' ||
				tag === 'template'
			);
		case 'optgroup':
			return tag === 'option' || tag === '#text';
		// Strictly speaking, seeing an <option> doesn't mean we're in a <select>
		// but
		case 'option':
			return tag === '#text';
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intd
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incaption
		// No special behavior since these rules fall back to "in body" mode for
		// all except special table nodes which cause bad parsing behavior anyway.

		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intr
		case 'tr':
			return (
				tag === 'th' || tag === 'td' || tag === 'style' || tag === 'script' || tag === 'template'
			);
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intbody
		case 'tbody':
		case 'thead':
		case 'tfoot':
			return tag === 'tr' || tag === 'style' || tag === 'script' || tag === 'template';
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incolgroup
		case 'colgroup':
			return tag === 'col' || tag === 'template';
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intable
		case 'table':
			return (
				tag === 'caption' ||
				tag === 'colgroup' ||
				tag === 'tbody' ||
				tag === 'tfoot' ||
				tag === 'thead' ||
				tag === 'style' ||
				tag === 'script' ||
				tag === 'template'
			);
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inhead
		case 'head':
			return (
				tag === 'base' ||
				tag === 'basefont' ||
				tag === 'bgsound' ||
				tag === 'link' ||
				tag === 'meta' ||
				tag === 'title' ||
				tag === 'noscript' ||
				tag === 'noframes' ||
				tag === 'style' ||
				tag === 'script' ||
				tag === 'template'
			);
		// https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
		case 'html':
			return tag === 'head' || tag === 'body' || tag === 'frameset';
		case 'frameset':
			return tag === 'frame';
		case '#document':
			return tag === 'html';
	}

	// Probably in the "in body" parsing mode, so we outlaw only tag combos
	// where the parsing rules cause implicit opens or closes to be added.
	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
	switch (tag) {
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
			return (
				parent_tag !== 'h1' &&
				parent_tag !== 'h2' &&
				parent_tag !== 'h3' &&
				parent_tag !== 'h4' &&
				parent_tag !== 'h5' &&
				parent_tag !== 'h6'
			);

		case 'rp':
		case 'rt':
			return implied_end_tags.indexOf(parent_tag) === -1;

		case 'body':
		case 'caption':
		case 'col':
		case 'colgroup':
		case 'frameset':
		case 'frame':
		case 'head':
		case 'html':
		case 'tbody':
		case 'td':
		case 'tfoot':
		case 'th':
		case 'thead':
		case 'tr':
			// These tags are only valid with a few parents that have special child
			// parsing rules -- if we're down here, then none of those matched and
			// so we allow it only if we don't know what the parent is, as all other
			// cases are invalid.
			return parent_tag == null;
	}

	return true;
}
