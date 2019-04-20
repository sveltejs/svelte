import fs from 'fs';
import path from 'path';
import { extract_frontmatter, langs, link_renderer } from '../../utils/markdown.js';
import marked from 'marked';
import PrismJS from 'prismjs';
import 'prismjs/components/prism-bash';

export default function get_posts() {
	return fs
		.readdirSync('content/blog')
		.map(file => {
			if (path.extname(file) !== '.md') return;

			const match = /^(\d+-\d+-\d+)-(.+)\.md$/.exec(file);
			if (!match) throw new Error(`Invalid filename '${file}'`);

			const [, pubdate, slug] = match;

			const markdown = fs.readFileSync(`content/blog/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const date = new Date(`${pubdate} EDT`); // cheeky hack
			metadata.pubdate = pubdate;
			metadata.dateString = date.toDateString();

			const renderer = new marked.Renderer();

			renderer.link = link_renderer;

			renderer.code = (source, lang) => {
				const plang = langs[lang];
				const highlighted = PrismJS.highlight(
					source,
					PrismJS.languages[plang],
					lang,
				);

				return `<pre class='language-${plang}'><code>${highlighted}</code></pre>`;
			};

			const html = marked(
				content.replace(/^\t+/gm, match => match.split('\t').join('  ')),
				{ renderer }
			);

			return {
				html,
				metadata,
				slug
			};
		})
		.sort((a, b) => a.metadata.pubdate < b.metadata.pubdate ? 1 : -1);
}
