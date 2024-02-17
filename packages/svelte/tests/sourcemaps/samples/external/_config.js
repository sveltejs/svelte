import { test } from '../../test';
import { magic_string_bundle } from '../../helpers.js';

const COMMON = ':global(html) { height: 100%; }\n';

// TODO: removing '\n' breaks test
// - _actual.svelte.map looks correct
// - _actual.css.map adds reference to </style> on input.svelte
// - Most probably caused by bug in current magic-string version (fixed in 0.25.7)
const STYLES = '.awesome { color: orange; }\n';

export default test({
	css_map_sources: ['common.scss', 'styles.scss'],
	preprocess: [
		{
			style: () => {
				return magic_string_bundle([
					{ filename: 'common.scss', code: COMMON },
					{ filename: 'styles.scss', code: STYLES }
				]);
			}
		}
	],
	client: [],
	preprocessed: [
		'Divs ftw!',
		{ code: COMMON, str: 'height: 100%;' },
		{ code: STYLES, str: 'color: orange;' }
	]
});
