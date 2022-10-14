// source: https://html.spec.whatwg.org/multipage/indices.html
const _boolean_attributes = [
	'allowfullscreen',
	'allowpaymentrequest',
	'async',
	'autofocus',
	'autoplay',
	'checked',
	'controls',
	'default',
	'defer',
	'disabled',
	'formnovalidate',
	'hidden',
	'indeterminate',
	'inert',
	'ismap',
	'itemscope',
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
	'selected'
] as const;

export type BooleanAttributes = typeof _boolean_attributes[number];
export const boolean_attributes: Set<string> = new Set([..._boolean_attributes]);
