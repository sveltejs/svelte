import fs from 'fs';
import path from 'path';
import { extract_frontmatter, extract_metadata, langs } from '../../utils/markdown.js';
import marked from 'marked';
import PrismJS from 'prismjs';
import 'prismjs/components/prism-bash';

const escaped = {
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
};

const unescaped = Object.keys(escaped).reduce(
	(unescaped, key) => ((unescaped[escaped[key]] = key), unescaped),
	{}
);

function unescape(str) {
	return String(str).replace(/&.+?;/g, match => unescaped[match] || match);
}

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
	return fs
		.readdirSync(`content/docs`)
		.filter(file => file[0] !== '.' && path.extname(file) === '.md')
		.map(file => {
			const markdown = fs.readFileSync(`content/docs/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const subsections = [];

			const renderer = new marked.Renderer();

			let block_open = false;

			renderer.hr = (...args) => {
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

				const plang = langs[lang];
				const highlighted = PrismJS.highlight(
					source,
					PrismJS.languages[plang],
					lang
				);

				let html = `<div class='${className}'>${prefix}<pre class='language-${plang}'><code>${highlighted}</code></pre></div>`;

				if (block_open) {
					block_open = false;
					return `</div><div class="code">${html}</div></div>`;
				}

				return html;
			};

			const seen = new Set();

			renderer.heading = (text, level, rawtext) => {
				if (level <= 4) {
					const slug = rawtext
						.toLowerCase()
						.replace(/[^a-zA-Z0-9]+/g, '-')
						.replace(/^-/, '')
						.replace(/-$/, '');

					if (seen.has(slug)) throw new Error(`Duplicate slug ${slug}`);
					seen.add(slug);

					if (level === 3) {
						const title = unescape(
							text
								.replace(/<\/?code>/g, '')
								.replace(/\.(\w+)(\((.+)?\))?/, (m, $1, $2, $3) => {
									if ($3) return `.${$1}(...)`;
									if ($2) return `.${$1}()`;
									return `.${$1}`;
								})
						);

						subsections.push({ slug, title });
					}

					return `
						<h${level}>
							<span id="${slug}" class="offset-anchor" ${level === 4 ? 'data-level=4' : ''}></span>
							<a href="docs#${slug}" class="anchor" aria-hidden="true"></a>
							${text}
						</h${level}>`;
				}

				return `<h${level}>${text}</h${level}>`;
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
				slug: file.replace(/^\d+-/, '').replace(/\.md$/, ''),
				file,
			};
		});
}
