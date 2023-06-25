<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const OLD_IDs = [
		'before-we-begin',
		'getting-started',
		'component-format',
		'component-format-script',
		'component-format-script-1-export-creates-a-component-prop',
		'component-format-script-2-assignments-are-reactive',
		'component-format-script-3-$-marks-a-statement-as-reactive',
		'component-format-script-4-prefix-stores-with-$-to-access-their-values',
		'component-format-script-context-module',
		'component-format-style',
		'template-syntax',
		'template-syntax-tags',
		'template-syntax-attributes-and-props',
		'template-syntax-text-expressions',
		'template-syntax-comments',
		'template-syntax-if',
		'template-syntax-each',
		'template-syntax-await',
		'template-syntax-key',
		'template-syntax-html',
		'template-syntax-debug',
		'template-syntax-const',
		'template-syntax-element-directives',
		'template-syntax-element-directives-on-eventname',
		'template-syntax-element-directives-bind-property',
		'template-syntax-element-directives-bind-group',
		'template-syntax-element-directives-bind-this',
		'template-syntax-element-directives-class-name',
		'template-syntax-element-directives-style-property',
		'template-syntax-element-directives-use-action',
		'template-syntax-element-directives-transition-fn',
		'template-syntax-element-directives-in-fn-out-fn',
		'template-syntax-element-directives-animate-fn',
		'template-syntax-component-directives',
		'template-syntax-component-directives-on-eventname',
		'template-syntax-component-directives---style-props',
		'template-syntax-component-directives-bind-property',
		'template-syntax-component-directives-bind-this',
		'template-syntax-slot',
		'template-syntax-slot-slot-name-name',
		'template-syntax-slot-$$slots',
		'template-syntax-slot-slot-key-value',
		'template-syntax-svelte-self',
		'template-syntax-svelte-component',
		'template-syntax-svelte-element',
		'template-syntax-svelte-window',
		'template-syntax-svelte-document',
		'template-syntax-svelte-body',
		'template-syntax-svelte-head',
		'template-syntax-svelte-options',
		'template-syntax-svelte-fragment',
		'run-time',
		'run-time-svelte',
		'run-time-svelte-onmount',
		'run-time-svelte-beforeupdate',
		'run-time-svelte-afterupdate',
		'run-time-svelte-ondestroy',
		'run-time-svelte-tick',
		'run-time-svelte-setcontext',
		'run-time-svelte-getcontext',
		'run-time-svelte-hascontext',
		'run-time-svelte-getallcontexts',
		'run-time-svelte-createeventdispatcher',
		'run-time-svelte-store',
		'run-time-svelte-store-writable',
		'run-time-svelte-store-readable',
		'run-time-svelte-store-derived',
		'run-time-svelte-store-get',
		'run-time-svelte-store-readonly',
		'run-time-svelte-motion',
		'run-time-svelte-motion-tweened',
		'run-time-svelte-motion-spring',
		'run-time-svelte-transition',
		'run-time-svelte-transition-fade',
		'run-time-svelte-transition-blur',
		'run-time-svelte-transition-fly',
		'run-time-svelte-transition-slide',
		'run-time-svelte-transition-scale',
		'run-time-svelte-transition-draw',
		'run-time-svelte-transition-crossfade',
		'run-time-svelte-animate',
		'run-time-svelte-animate-flip',
		'run-time-svelte-easing',
		'run-time-svelte-register',
		'run-time-client-side-component-api',
		'run-time-client-side-component-api-creating-a-component',
		'run-time-client-side-component-api-$set',
		'run-time-client-side-component-api-$on',
		'run-time-client-side-component-api-$destroy',
		'run-time-client-side-component-api-component-props',
		'run-time-custom-element-api',
		'run-time-server-side-component-api',
		'compile-time',
		'compile-time-svelte-compile',
		'compile-time-svelte-parse',
		'compile-time-svelte-preprocess',
		'compile-time-svelte-walk',
		'compile-time-svelte-version',
		'accessibility-warnings',
		'accessibility-warnings-a11y-accesskey',
		'accessibility-warnings-a11y-aria-activedescendant-has-tabindex',
		'accessibility-warnings-a11y-aria-attributes',
		'accessibility-warnings-a11y-autofocus',
		'accessibility-warnings-a11y-click-events-have-key-events',
		'accessibility-warnings-a11y-distracting-elements',
		'accessibility-warnings-a11y-hidden',
		'accessibility-warnings-a11y-img-redundant-alt',
		'accessibility-warnings-a11y-incorrect-aria-attribute-type',
		'accessibility-warnings-a11y-invalid-attribute',
		'accessibility-warnings-a11y-interactive-supports-focus',
		'accessibility-warnings-a11y-label-has-associated-control',
		'accessibility-warnings-a11y-media-has-caption',
		'accessibility-warnings-a11y-misplaced-role',
		'accessibility-warnings-a11y-misplaced-scope',
		'accessibility-warnings-a11y-missing-attribute',
		'accessibility-warnings-a11y-missing-content',
		'accessibility-warnings-a11y-mouse-events-have-key-events',
		'accessibility-warnings-a11y-no-redundant-roles',
		'accessibility-warnings-a11y-no-interactive-element-to-noninteractive-role',
		'accessibility-warnings-a11y-no-noninteractive-element-to-interactive-role',
		'accessibility-warnings-a11y-no-noninteractive-tabindex',
		'accessibility-warnings-a11y-positive-tabindex',
		'accessibility-warnings-a11y-role-has-required-aria-props',
		'accessibility-warnings-a11y-role-supports-aria-props',
		'accessibility-warnings-a11y-structure',
		'accessibility-warnings-a11y-unknown-aria-attribute',
		'accessibility-warnings-a11y-unknown-role'
	];

	/** @type {Map<RegExp, string>}*/
	const pages_regex_map = new Map([
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
		[
			/run-time-(svelte-easing|server-side-component-api|custom-element-api|svelte-register)$/i,
			'$1'
		],
		// Catch all, should be at the end or will include store, motion, transition and other modules starting with svelte
		[/run-time-(svelte)(?:-(.+))?/i, '$1#$2'],

		// Compile time
		[/compile-time-svelte-?(.*)/i, 'svelte-compiler#$1'],

		// Accessibility warnings
		[/(accessibility-warnings)-?(.+)/i, '$1#$2']
	]);

	function get_old_new_ids_map() {
		/** @type {Map<string, string>} */
		const new_ids = new Map();

		old_id_block: for (const old_id of OLD_IDs) {
			for (const [regex, replacement] of pages_regex_map) {
				if (regex.test(old_id)) {
					new_ids.set(
						old_id,
						old_id
							.replace(regex, replacement)
							.replace(/#$/, '') // Replace trailing # at the end
							.replace('#--', '#') // have to do the -- replacement because of `--style-props` in old being `style-props` in new
					);
					continue old_id_block;
				}
			}
		}

		return new_ids;
	}

	function get_url_to_redirect_to() {
		const hash = $page.url.hash.replace(/^#/i, '');

		if (!hash) return '/docs/introduction';

		const old_new_map = get_old_new_ids_map();

		// ID doesn't match anything, take the user to intro page only
		if (!old_new_map.has(hash)) return '/docs/introduction';

		return `/docs/${old_new_map.get(hash)}`;
	}

	onMount(() => {
		console.log(get_old_new_ids_map()); // for debugging purposes in prod
		goto(get_url_to_redirect_to(), { replaceState: true });
	});
</script>
