/** @type {[RegExp, string][]}*/
const pages_regex_map = [
	// Basic ones
	[/(before-we-begin|getting-started)$/i, 'introduction'],
	[/template-syntax$/i, 'basic-markup'],
	[/component-format$/i, 'svelte-components'],
	[/run-time$/i, 'svelte'],
	[/compile-time$/i, 'svelte-compiler'],
	[/(accessibility-warnings)$/i, '$1'],

	// component-format-
	[/component-format-(script|style|script-context-module)$/i, 'svelte-components#$1'],
	[/component-format-(script)(?:-?(.*))$/i, 'svelte-components#$1-$2'],

	// template-syntax
	[/template-syntax-((?:element|component)-directives)-?(.*)/i, '$1#$2'],
	[/template-syntax-slot$/i, 'special-elements#slot'],
	[/template-syntax-(slot)-?(.*)/i, 'special-elements#$1-$2'],
	[/template-syntax-(if|each|await|key)$/i, 'logic-blocks#$1'],
	[/template-syntax-(const|debug|html)$/i, 'special-tags#$1'],
	[/template-syntax-(tags|attributes-and-props|text-expressions|comments)$/i, 'basic-markup#$1'],
	// !!!! This one should stay at the bottom of `template-syntax`, or it may end up hijacking logic blocks and special tags
	[/template-syntax-(.+)/i, 'special-elements#$1'],

	// run-time
	[/run-time-(svelte-(?:store|motion|transition|animate))-?(.*)/i, '$1#$2'],
	[/run-time-(client-side-component-api)-?(.*)/i, '$1#$2'],
	[/run-time-(svelte-easing|server-side-component-api|custom-element-api|svelte-register)$/i, '$1'],
	// Catch all, should be at the end or will include store, motion, transition and other modules starting with svelte
	[/run-time-(svelte)(?:-(.+))?/i, '$1#$2'],

	// Compile time
	[/compile-time-svelte-?(.*)/i, 'svelte-compiler#$1'],

	// Accessibility warnings
	[/(accessibility-warnings)-?(.+)/i, '$1#$2']
];

function get_url_to_redirect_to() {
	const hash = location.hash.slice(1);
	if (!hash) return '/docs/introduction';

	for (const [regex, replacement] of pages_regex_map) {
		if (regex.test(hash)) {
			return `/docs/${
				hash
					.replace(regex, replacement)
					.replace(/#$/, '') // Replace trailing # at the end
					.replace('#--', '#') // have to do the -- replacement because of `--style-props` in old being `style-props` in new
			}`;
		}
	}

	// ID doesn't match anything, take the user to intro page only
	return '/docs/introduction';
}

location.href = new URL(get_url_to_redirect_to(), location.origin).href;
