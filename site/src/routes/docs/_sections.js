import fs from 'fs';
import path from 'path';
import { SLUG_PRESERVE_UNICODE, SLUG_SEPARATOR } from '../../../config';
import { extract_frontmatter, extract_metadata, link_renderer } from '@sveltejs/site-kit/utils/markdown.js';
import { make_session_slug_processor } from '@sveltejs/site-kit/utils/slug';
import { highlight } from '../../utils/highlight';
import marked from 'marked';

const blockTypes = [
	'blockquote',
	'html',
	'heading',
	'hr',
	'list',
	'listitem',
	'paragraph',
	'table',
	'tablerow',
	'tablecell'
];

export default function() {
	const make_slug = make_session_slug_processor({
		preserve_unicode: SLUG_PRESERVE_UNICODE,
		separator: SLUG_SEPARATOR
	});

	return fs
		.readdirSync(`content/docs`)
		.filter(file => file[0] !== '.' && path.extname(file) === '.md')
		.map(file => {
			const markdown = fs.readFileSync(`content/docs/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const section_slug = make_slug(metadata.title);

			const subsections = [];

			const renderer = new marked.Renderer();

			let block_open = false;

			renderer.link = link_renderer;

			renderer.hr = () => {
				block_open = true;

				return '<div class="side-by-side"><div class="copy">';
			};

			renderer.code = (source, lang) => {
				source = source.replace(/^ +/gm, match =>
					match.split('    ').join('\t')
				);

				const lines = source.split('\n');

				const meta = extract_metadata(lines[0], lang);

				let prefix = '';
				let className = 'code-block';

				if (meta) {
					source = lines.slice(1).join('\n');
					const filename = meta.filename || (lang === 'html' && 'App.svelte');
					if (filename) {
						prefix = `<span class='filename'>${prefix} ${filename}</span>`;
						className += ' named';
					}
				}

				if (meta && meta.hidden) return '';

				const html = `<div class='${className}'>${prefix}${highlight(source, lang)}</div>`;

				if (block_open) {
					block_open = false;
					return `</div><div class="code">${html}</div></div>`;
				}

				return html;
			};

			renderer.heading = (text, level, rawtext) => {
				let slug;

				const match = /<a href="([^"]+)"[^>]*>(.+)<\/a>/.exec(text);
				if (match) {
					slug = match[1];
					text = match[2];
				} else {
					slug = make_slug(rawtext);
				}

				if (level === 3 || level === 4) {
					const title = text
						.replace(/<\/?code>/g, '')
						.replace(/\.(\w+)(\((.+)?\))?/, (m, $1, $2, $3) => {
							if ($3) return `.${$1}(...)`;
							if ($2) return `.${$1}()`;
							return `.${$1}`;
						});

					subsections.push({ slug, title, level });
				}

				return `
					<h${level}>
						<span id="${slug}" class="offset-anchor" ${level > 4 ? 'data-scrollignore' : ''}></span>
						<a href="docs#${slug}" class="anchor" aria-hidden="true"></a>
						${text}
					</h${level}>`;
			};

			blockTypes.forEach(type => {
				const fn = renderer[type];
				renderer[type] = function() {
					return fn.apply(this, arguments);
				};
			});

			const html = marked(content, { renderer });

			const hashes = {};

			return {
				html: html.replace(/@@(\d+)/g, (m, id) => hashes[id] || m),
				metadata,
				subsections,
				slug: section_slug,
				file,
			};
		});
}
