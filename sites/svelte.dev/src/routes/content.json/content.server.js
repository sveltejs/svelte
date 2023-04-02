import { normalizeSlugify, removeMarkdown } from '$lib/server/docs';
import { extract_frontmatter, transform } from '$lib/server/markdown';
import fs from 'node:fs';
import path from 'node:path';
import glob from 'tiny-glob/sync.js';

const base = '../../site/content/';

const categories = [
	{
		slug: 'docs',
		label: null,
		/** @param {string[]} parts */
		href: (parts) =>
			parts.length > 1 ? `/docs/${parts[0]}#${parts.slice(1).join('-')}` : `/docs/${parts[0]}`
	},
	{
		slug: 'faq',
		label: 'FAQ',
		/** @param {string[]} parts */
		href: (parts) => `/faq#${parts.join('-')}`
	}
];

export function content() {
	/** @type {import('@sveltejs/site-kit/search').Block[]} */
	const blocks = [];

	for (const category of categories) {
		const breadcrumbs = category.label ? [category.label] : [];

		for (const file of glob('**/*.md', { cwd: `${base}/${category.slug}` })) {
			const basename = path.basename(file);
			const match = /\d{2}-(.+)\.md/.exec(basename);
			if (!match) continue;

			const slug = match[1];

			const filepath = `${base}/${category.slug}/${file}`;
			// const markdown = replace_placeholders(fs.readFileSync(filepath, 'utf-8'));
			const markdown = fs.readFileSync(filepath, 'utf-8');

			const { body, metadata } = extract_frontmatter(markdown);

			const sections = body.trim().split(/^### /m);
			const intro = sections.shift().trim();
			const rank = +metadata.rank || undefined;

			blocks.push({
				breadcrumbs: [...breadcrumbs, removeMarkdown(metadata.title ?? '')],
				href: category.href([slug]),
				content: plaintext(intro),
				rank
			});

			for (const section of sections) {
				const lines = section.split('\n');
				const h3 = lines.shift();
				const content = lines.join('\n');

				const subsections = content.trim().split('### ');

				const intro = subsections.shift().trim();

				blocks.push({
					breadcrumbs: [...breadcrumbs, removeMarkdown(metadata.title), removeMarkdown(h3)],
					href: category.href([slug, normalizeSlugify(h3)]),
					content: plaintext(intro),
					rank
				});

				for (const subsection of subsections) {
					const lines = subsection.split('\n');
					const h4 = lines.shift();

					blocks.push({
						breadcrumbs: [
							...breadcrumbs,
							removeMarkdown(metadata.title),
							removeMarkdown(h3),
							removeMarkdown(h4)
						],
						href: category.href([slug, normalizeSlugify(h3), normalizeSlugify(h4)]),
						content: plaintext(lines.join('\n').trim()),
						rank
					});
				}
			}
		}
	}

	return blocks;
}

/** @param {string} markdown */
function plaintext(markdown) {
	/** @param {unknown} text */
	const block = (text) => `${text}\n`;

	/** @param {string} text */
	const inline = (text) => text;

	return transform(markdown, {
		code: (source) => source.split('// ---cut---\n').pop(),
		blockquote: block,
		html: () => '\n',
		heading: (text) => `${text}\n`,
		hr: () => '',
		list: block,
		listitem: block,
		checkbox: block,
		paragraph: (text) => `${text}\n\n`,
		table: block,
		tablerow: block,
		tablecell: (text, opts) => {
			return text + ' ';
		},
		strong: inline,
		em: inline,
		codespan: inline,
		br: () => '',
		del: inline,
		link: (href, title, text) => text,
		image: (href, title, text) => text,
		text: inline
	})
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&#(\d+);/g, (match, code) => {
			return String.fromCharCode(code);
		})
		.trim();
}
