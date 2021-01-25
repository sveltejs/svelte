// The `foreign` namespace covers all DOM implementations that aren't HTML5.
// It opts out of HTML5-specific a11y checks and case-insensitive attribute names.
export const foreign = 'https://svelte.dev/docs#svelte_options';
export const html = 'http://www.w3.org/1999/xhtml';
export const mathml = 'http://www.w3.org/1998/Math/MathML';
export const svg = 'http://www.w3.org/2000/svg';
export const xlink = 'http://www.w3.org/1999/xlink';
export const xml = 'http://www.w3.org/XML/1998/namespace';
export const xmlns = 'http://www.w3.org/2000/xmlns';

export const valid_namespaces = [
	'foreign',
	'html',
	'mathml',
	'svg',
	'xlink',
	'xml',
	'xmlns',
	foreign,
	html,
	mathml,
	svg,
	xlink,
	xml,
	xmlns
];

export const namespaces: Record<string, string> = { foreign, html, mathml, svg, xlink, xml, xmlns };
