import { langs } from '@sveltejs/site-kit/utils/markdown.js';
import PrismJS from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prism-svelte';

export function highlight(source, lang) {
	const plang = langs[lang] || '';
	const highlighted = plang ? PrismJS.highlight(
		source,
		PrismJS.languages[plang],
		lang,
	) : source.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

	return `<pre class='language-${plang}'><code>${highlighted}</code></pre>`;
}
