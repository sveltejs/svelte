import fs from 'fs';
import path from 'path';
import manifest from '../../../../content/examples/manifest.json';

const lookup = new Map();
const titles = new Map();
const slugs = new Set();

manifest.forEach(group => {
	group.examples.forEach(example => {
		titles.set(example.slug, example.title);
		slugs.add(example.slug);
	});
});

function createExample(slug) {
	const files = fs.readdirSync(`content/examples/${slug}`);

	const components = files
		.map(file => {
			const ext = path.extname(file);
			if (ext !== '.svelte' && ext !== '.js') return null;

			const source = fs.readFileSync(`content/examples/${slug}/${file}`, 'utf-8');

			return {
				name: file.replace(ext, ''),
				type: ext.slice(1),
				source
			};
		})
		.filter(Boolean)
		.sort((a, b) => {
			if (a.name === 'App' && a.type === 'svelte') return -1;
			if (b.name === 'App' && b.type === 'svelte') return 1;

			if (a.type !== b.type) return a.type === 'svelte' ? -1 : 1;

			return a.name < b.name ? -1 : 1;
		});

	const json5 = fs.existsSync(`content/examples/${slug}/data.json5`)
		? fs.readFileSync(`content/examples/${slug}/data.json5`, 'utf-8')
		: '{}';

	return JSON.stringify({
		title: titles.get(slug),
		components,
		json5
	});
}

export function get(req, res) {
	const { slug } = req.params;

	try {
		if (!lookup.has(slug) || process.env.NODE_ENV !== 'production') {
			lookup.set(slug, createExample(slug));
		}

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(lookup.get(slug));
	} catch (err) {
		res.writeHead(404, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({ error: 'not found' }));
	}
}