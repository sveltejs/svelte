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
	'inert',
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
	'selected'
] as const;

export type BooleanAttributes = typeof _boolean_attributes[number];

/**
 * List of HTML boolean attributes (e.g. `<input disabled>`).
 * Source: https://html.spec.whatwg.org/multipage/indices.html
 */
export const boolean_attributes: Set<string> = new Set([..._boolean_attributes]);
