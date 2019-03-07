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

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function getHash(str) {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return (hash >>> 0).toString(36);
}

export const demos = new Map();

export default function() {
	return fs
		.readdirSync(`content/guide`)
		.filter(file => file[0] !== '.' && path.extname(file) === '.md')
		.map(file => {
			const markdown = fs.readFileSync(`content/guide/${file}`, 'utf-8');

			const { content, metadata } = extract_frontmatter(markdown);

			const subsections = [];
			const groups = [];
			let group = null;
			let uid = 1;

			const renderer = new marked.Renderer();

			renderer.code = (source, lang) => {
				source = source.replace(/^ +/gm, match =>
					match.split('    ').join('\t')
				);

				const lines = source.split('\n');

				const meta = extract_metadata(lines[0], lang);

				let prefix = '';
				let className = 'code-block';

				if (lang === 'html' && !group) {
					if (!meta || meta.repl !== false) {
						prefix = `<a class='open-in-repl' href='repl?demo=@@${uid}' title='open in REPL'><svg class='icon'><use xlink:href='#maximize-2' /></svg></a>`;
					}

					group = { id: uid++, blocks: [] };
					groups.push(group);
				}

				if (meta) {
					source = lines.slice(1).join('\n');
					const filename = meta.filename || (lang === 'html' && 'App.svelte');
					if (filename) {
						prefix = `<span class='filename'>${prefix} ${filename}</span>`;
						className += ' named';
					}
				}

				if (group) group.blocks.push({ meta: meta || {}, lang, source });

				if (meta && meta.hidden) return '';

				const plang = langs[lang];
				const highlighted = PrismJS.highlight(
					source,
					PrismJS.languages[plang],
					lang
				);

				return `<div class='${className}'>${prefix}<pre class='language-${plang}'><code>${highlighted}</code></pre></div>`;
			};

			const seen = new Set();

			renderer.heading = (text, level, rawtext) => {
				if (level <= 3) {
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
							<span id="${slug}" class="offset-anchor"></span>
							<a href="guide#${slug}" class="anchor" aria-hidden="true"></a>
							${text}
						</h${level}>`;
				}

				return `<h${level}>${text}</h${level}>`;
			};

			blockTypes.forEach(type => {
				const fn = renderer[type];
				renderer[type] = function() {
					group = null;
					return fn.apply(this, arguments);
				};
			});

			const html = marked(content, { renderer });

			const hashes = {};

			groups.forEach(group => {
				const main = group.blocks[0];
				if (main.meta.repl === false) return;

				const hash = getHash(group.blocks.map(block => block.source).join(''));
				hashes[group.id] = hash;

				const json5 = group.blocks.find(block => block.lang === 'json');

				const title = main.meta.title;
				if (!title) console.error(`Missing title for demo in ${file}`);

				demos.set(
					hash,
					JSON.stringify({
						title: title || 'Example from guide',
						components: group.blocks
							.filter(block => block.lang === 'html' || block.lang === 'js')
							.map(block => {
								const [name, type] = (block.meta.filename || '').split('.');
								return {
									name: name || 'App',
									type: type || 'html',
									source: block.source,
								};
							}),
						json5: json5 && json5.source,
					})
				);
			});

			return {
				html: html.replace(/@@(\d+)/g, (m, id) => hashes[id] || m),
				metadata,
				subsections,
				slug: file.replace(/^\d+-/, '').replace(/\.md$/, ''),
				file,
			};
		});
}
