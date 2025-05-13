export const EACH_ITEM_REACTIVE = 1;
export const EACH_INDEX_REACTIVE = 1 << 1;
/** See EachBlock interface metadata.is_controlled for an explanation what this is */
export const EACH_IS_CONTROLLED = 1 << 2;
export const EACH_IS_ANIMATED = 1 << 3;
export const EACH_ITEM_IMMUTABLE = 1 << 4;

export const PROPS_IS_IMMUTABLE = 1;
export const PROPS_IS_RUNES = 1 << 1;
export const PROPS_IS_UPDATED = 1 << 2;
export const PROPS_IS_BINDABLE = 1 << 3;
export const PROPS_IS_LAZY_INITIAL = 1 << 4;

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

export const NAMESPACE_HTML = 'http://www.w3.org/1999/xhtml';
export const NAMESPACE_SVG = 'http://www.w3.org/2000/svg';
export const NAMESPACE_MATHML = 'http://www.w3.org/1998/Math/MathML';

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

/**
 * Whitespace inside one of these elements will not result in
 * a whitespace node being created in any circumstances. (This
 * list is almost certainly very incomplete)
 * TODO this is currently unused
 */
export const ELEMENTS_WITHOUT_TEXT = ['audio', 'datalist', 'dl', 'optgroup', 'select', 'video'];

export const ATTACHMENT_KEY = '@attach';
