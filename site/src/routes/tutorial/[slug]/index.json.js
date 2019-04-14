import * as fs from 'fs';
import * as path from 'path';
import marked from 'marked';
import PrismJS from 'prismjs';
import { extract_frontmatter, extract_metadata, langs, link_renderer } from '../../../utils/markdown';

const cache = new Map();

function find_tutorial(slug) {
	const sections = fs.readdirSync(`content/tutorial`);

	for (const section of sections) {
		const chapters = fs.readdirSync(`content/tutorial/${section}`).filter(dir => /^\d+/.test(dir));
		for (const chapter of chapters) {
			if (slug === chapter.replace(/^\d+-/, '')) {
				return { section, chapter };
			}
		}
	}
}

function get_tutorial(slug) {
	const found = find_tutorial(slug);
	if (!found) return found;

	const dir = `content/tutorial/${found.section}/${found.chapter}`;

	const markdown = fs.readFileSync(`${dir}/text.md`, 'utf-8');
	const app_a = fs.readdirSync(`${dir}/app-a`);
	const app_b = fs.existsSync(`${dir}/app-b`) && fs.readdirSync(`${dir}/app-b`);

	const { content } = extract_frontmatter(markdown);

	const renderer = new marked.Renderer();

	renderer.link = link_renderer;

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

		const plang = langs[lang];
		const highlighted = PrismJS.highlight(
			source,
			PrismJS.languages[plang],
			lang
		);

		return `<div class='${className}'>${prefix}<pre class='language-${plang}'><code>${highlighted}</code></pre></div>`;
	};

	let html = marked(content, { renderer });
	if (found.chapter.startsWith('01')) {
		const meta = JSON.parse(fs.readFileSync(`content/tutorial/${found.section}/meta.json`));
		html = `<h2>${meta.title}</h2>\n${html}`;
	}

	function get_file(stage, file) {
		const ext = path.extname(file);
		const name = file.slice(0, -ext.length);
		const type = ext.slice(1);

		return {
			name,
			type,
			source: fs.readFileSync(`${dir}/${stage}/${file}`, 'utf-8')
		};
	}

	return {
		html,
		app_a: app_a.map(file => get_file('app-a', file)),
		app_b: app_b && app_b.map(file => get_file('app-b', file))
	};
}

export function get(req, res) {
	const { slug } = req.params;

	if (!cache.has(slug) || process.env.NODE_ENV !== 'production') {
		cache.set(slug, JSON.stringify(get_tutorial(slug)));
	}

	const json = cache.get(slug);

	res.set({
		'Content-Type': 'application/json'
	});

	if (json) {
		res.end(json);
	} else {
		res.statusCode = 404;
		res.end(JSON.stringify({ message: 'not found' }));
	}
}