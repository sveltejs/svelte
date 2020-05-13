import fs from 'fs';
import path from 'path';
import { extract_frontmatter, link_renderer } from '@sveltejs/site-kit/utils/markdown.js';
import marked from 'marked';
import { makeSlugProcessor } from '../../utils/slug';
import { highlight } from '../../utils/highlight';
import { SLUG_PRESERVE_UNICODE } from '../../../config';

const makeSlug = makeSlugProcessor(SLUG_PRESERVE_UNICODE);

export default function get_faqs() {
	return fs
		.readdirSync('content/faq')
		.map(file => {
			if (path.extname(file) !== '.md') return;

			const match = /^([0-9]+)-(.+)\.md$/.exec(file);
			if (!match) throw new Error(`Invalid filename '${file}'`);

			const [, order, slug] = match;

			const markdown = fs.readFileSync(`content/faq/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const renderer = new marked.Renderer();

			renderer.link = link_renderer;

			renderer.code = highlight;

			renderer.heading = (text, level, rawtext) => {
				const fragment = makeSlug(rawtext);

				return `
					<h${level}>
						<span id="${fragment}" class="offset-anchor"></span>
						<a href="faq#${fragment}" class="anchor" aria-hidden="true"></a>
						${text}
					</h${level}>`;
			};

			const answer = marked(
				content.replace(/^\t+/gm, match => match.split('\t').join('  ')),
				{ renderer }
			);

			const fragment = makeSlug(slug);

			return {
				fragment,
				order,
				answer,
				metadata
			};
		})
		.sort((a, b) => a.order - b.order);
}
