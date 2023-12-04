import { CONTENT_BASE_PATHS } from '../../../constants.js';

/**
 * @param {import('./types').ExamplesData} examples_data
 * @param {string} slug
 */
export function get_example(examples_data, slug) {
	for (const section of examples_data) {
		for (const example of section.examples) {
			if (example.slug === slug) {
				return example;
			}
		}
	}

	return null;
}

/**
 * @returns {Promise<import('./types').ExamplesData>}
 */
export async function get_examples_data(base = CONTENT_BASE_PATHS.EXAMPLES) {
	const { readdir, stat, readFile } = await import('node:fs/promises');

	const examples = [];

	for (const subdir of await readdir(base)) {
		/** @type {import('./types').ExamplesDatum} */
		const section = {
			title: '', // Initialise with empty
			slug: subdir.split('-').slice(1).join('-'),
			examples: []
		};

		if (!((await stat(`${base}/${subdir}`)).isDirectory() || subdir.endsWith('meta.json')))
			continue;

		if (!subdir.endsWith('meta.json'))
			section.title =
				JSON.parse(await readFile(`${base}/${subdir}/meta.json`, 'utf-8')).title ?? 'Embeds';

		for (const section_dir of await readdir(`${base}/${subdir}`)) {
			const match = /\d{2}-(.+)/.exec(section_dir);
			if (!match) continue;

			const slug = match[1];

			const example_base_dir = `${base}/${subdir}/${section_dir}`;

			// Get title for
			const example_title = JSON.parse(
				await readFile(`${example_base_dir}/meta.json`, 'utf-8')
			).title;

			/**
			 * @type {Array<{
			 *   name: string;
			 *   type: string;
			 *   content: string;
			 * }>}
			 */
			const files = [];
			for (const file of (await readdir(example_base_dir)).filter(
				(file) => !file.endsWith('meta.json')
			)) {
				const type = file.split('.').at(-1);
				if (!type) {
					throw new Error(`Could not determine type from ${file}`);
				}
				files.push({
					name: file,
					type,
					content: await readFile(`${example_base_dir}/${file}`, 'utf-8')
				});
			}

			section.examples.push({ title: example_title, slug, files });
		}

		examples.push(section);
	}

	return examples;
}

/**
 * @param {import('./types').ExamplesData} examples_data
 * @returns {import('./types').ExamplesList}
 */
export function get_examples_list(examples_data) {
	return examples_data.map((section) => ({
		title: section.title,
		examples: section.examples.map((example) => ({
			title: example.title,
			slug: example.slug
		}))
	}));
}
