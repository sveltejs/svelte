import { modules } from '$lib/generated/type-info.js';
import {
	extractFrontmatter,
	markedTransform,
	normalizeSlugify,
	removeMarkdown,
	replaceExportTypePlaceholders
} from '@sveltejs/site-kit/markdown';
import { readFile } from 'node:fs/promises';
import glob from 'tiny-glob';
import { CONTENT_BASE } from '../../constants.js';

const base = CONTENT_BASE;

/** @param {string[]} parts */
function get_href(parts) {
	return parts.length > 1 ? `/docs/${parts[0]}#${parts.at(-1)}` : `/docs/${parts[0]}`;
}

/** @param {string} path  */
function path_basename(path) {
	return path.split(/[\\/]/).pop();
}

export async function content() {
	/** @type {import('@sveltejs/site-kit/search').Block[]} */
	const blocks = [];

	/** @type {string[]} */
	const breadcrumbs = [];

	for (const file of await glob('**/*.md', { cwd: `${base}/docs` })) {
		const basename = path_basename(file);
		const match = basename && /\d{2}-(.+)\.md/.exec(basename);
		if (!match) continue;

		const slug = match[1];

		const filepath = `${base}/docs/${file}`;
		const markdown = await replaceExportTypePlaceholders(
			await readFile(filepath, 'utf-8'),
			modules
		);

		const { body, metadata } = extractFrontmatter(markdown);

		const sections = body.trim().split(/^## /m);
		const intro = sections?.shift()?.trim();
		const rank = +metadata.rank;

		if (intro) {
			blocks.push({
				breadcrumbs: [...breadcrumbs, removeMarkdown(metadata.title ?? '')],
				href: get_href([slug]),
				content: await plaintext(intro),
				rank
			});
		}

		for (const section of sections) {
			const lines = section.split('\n');
			const h2 = lines.shift();
			if (!h2) {
				console.warn('Could not find expected heading h2');
				continue;
			}

			const content = lines.join('\n');
			const subsections = content.trim().split('## ');
			const intro = subsections?.shift()?.trim();
			if (intro) {
				blocks.push({
					breadcrumbs: [...breadcrumbs, removeMarkdown(metadata.title), removeMarkdown(h2)],
					href: get_href([slug, normalizeSlugify(h2)]),
					content: await plaintext(intro),
					rank
				});
			}

			for (const subsection of subsections) {
				const lines = subsection.split('\n');
				const h3 = lines.shift();
				if (!h3) {
					console.warn('Could not find expected heading h3');
					continue;
				}

				blocks.push({
					breadcrumbs: [
						...breadcrumbs,
						removeMarkdown(metadata.title),
						removeMarkdown(h2),
						removeMarkdown(h3)
					],
					href: get_href([slug, normalizeSlugify(h2) + '-' + normalizeSlugify(h3)]),
					content: await plaintext(lines.join('\n').trim()),
					rank
				});
			}
		}
	}

	return blocks;
}

/** @param {string} markdown */
async function plaintext(markdown) {
	/** @param {unknown} text */
	const block = (text) => `${text}\n`;

	/** @param {string} text */
	const inline = (text) => text;

	return (
		await markedTransform(markdown, {
			code: (source) => source.split('// ---cut---\n').pop() || 'ERROR: ---cut--- not found',
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
	)
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&#(\d+);/g, (match, code) => {
			return String.fromCharCode(code);
		})
		.trim();
}
