import MagicString, { Bundle } from 'magic-string';
import { test } from '../../test';

// A preprocessor that inlines a vendored module into the component. The component and the
// inlined module are both named `input.svelte`, so the returned map has two distinct sources
// sharing the component's basename. Rewriting both of them to the component basename would
// collapse two different files into one source, which `@jridgewell/remapping` rejects — the
// compile threw instead of producing a sourcemap.
export default test({
	preprocess: {
		script: ({ content }) => {
			const bundle = new Bundle({ separator: '\n' });
			bundle.addSource({ filename: 'input.svelte', content: new MagicString(content) });
			bundle.addSource({
				filename: 'vendor/input.svelte',
				content: new MagicString("const vendored = 'vendored';\n")
			});
			return {
				code: bundle.toString(),
				map: bundle.generateMap({ hires: true, includeContent: false })
			};
		}
	},
	// the vendored module stays a separate source instead of being folded into the component
	js_map_sources: ['../../input.svelte', '../../vendor/input.svelte'],
	// the component's own code still maps to its real position in `input.svelte`
	client: ['baritone']
});
