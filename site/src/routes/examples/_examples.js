import fs from 'fs';
import path from 'path';

let lookup;
const titles = new Map();

export function get_examples() {
	lookup = new Map();

	return fs.readdirSync(`content/examples`).map(group_dir => {
		const metadata = JSON.parse(fs.readFileSync(`content/examples/${group_dir}/meta.json`, 'utf-8'));

		return {
			title: metadata.title,
			examples: fs.readdirSync(`content/examples/${group_dir}`).filter(file => file !== 'meta.json').map(example_dir => {
				const slug = example_dir.replace(/^\d+-/, '');

				if (lookup.has(slug)) throw new Error(`Duplicate example slug "${slug}"`);
				lookup.set(slug, `${group_dir}/${example_dir}`);

				const metadata = JSON.parse(fs.readFileSync(`content/examples/${group_dir}/${example_dir}/meta.json`, 'utf-8'));
				titles.set(slug, metadata.title);

				return {
					slug,
					title: metadata.title
				};
			})
		};
	});
}

export function get_example(slug) {
	if (!lookup || !lookup.has(slug)) get_examples();

	const dir = lookup.get(slug);
	const title = titles.get(slug);

	if (!dir || !title) throw { status: 404, message: 'not found' };

	const files = fs.readdirSync(`content/examples/${dir}`)
		.filter(name => name[0] !== '.' && name !== 'meta.json')
		.map(name => {
			return {
				name,
				source: fs.readFileSync(`content/examples/${dir}/${name}`, 'utf-8')
			};
		});

	return { title, files };
}