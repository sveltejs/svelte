import { extractFrontmatter } from '@sveltejs/site-kit/markdown';
import { CONTENT_BASE_PATHS } from '../../../constants.js';
import { render_content } from '../renderer.js';

/**
 * @param {import('./types').TutorialData} tutorial_data
 * @param {string} slug
 */
export async function get_parsed_tutorial(tutorial_data, slug) {
	for (const { tutorials } of tutorial_data) {
		for (const tutorial of tutorials) {
			if (tutorial.slug === slug) {
				return {
					...tutorial,
					content: await render_content(`tutorial/${tutorial.dir}`, tutorial.content)
				};
			}
		}
	}

	return null;
}

/**
 * @returns {Promise<import('./types').TutorialData>}
 */
export async function get_tutorial_data(base = CONTENT_BASE_PATHS.TUTORIAL) {
	const { readdir, readFile, stat } = await import('node:fs/promises');

	const tutorials = [];

	for (const subdir of await readdir(base)) {
		const section = {
			title: '', // Initialise with empty
			slug: subdir.split('-').slice(1).join('-'),
			tutorials: []
		};

		if (!((await stat(`${base}/${subdir}`)).isDirectory() || subdir.endsWith('meta.json')))
			continue;

		if (!subdir.endsWith('meta.json'))
			section.title = JSON.parse(await readFile(`${base}/${subdir}/meta.json`, 'utf-8')).title;

		for (const section_dir of await readdir(`${base}/${subdir}`)) {
			const match = /\d{2}-(.+)/.exec(section_dir);
			if (!match) continue;

			const slug = match[1];

			const tutorial_base_dir = `${base}/${subdir}/${section_dir}`;

			// Read the file, get frontmatter
			const contents = await readFile(`${tutorial_base_dir}/text.md`, 'utf-8');
			const { metadata, body } = extractFrontmatter(contents);

			// Get the contents of the apps.
			const completion_states_data = { initial: [], complete: [] };
			for (const app_dir of await readdir(tutorial_base_dir)) {
				if (!app_dir.startsWith('app-')) continue;

				const app_dir_path = `${tutorial_base_dir}/${app_dir}`;
				const app_contents = await readdir(app_dir_path, 'utf-8');

				for (const file of app_contents) {
					completion_states_data[app_dir === 'app-a' ? 'initial' : 'complete'].push({
						name: file,
						type: file.split('.').at(-1),
						content: await readFile(`${app_dir_path}/${file}`, 'utf-8')
					});
				}
			}

			section.tutorials.push({
				title: metadata.title,
				slug,
				content: body,
				dir: `${subdir}/${section_dir}`,
				...completion_states_data
			});
		}

		tutorials.push(section);
	}

	return tutorials;
}

/**
 * @param {import('./types').TutorialData} tutorial_data
 * @returns {import('./types').TutorialsList}
 */
export function get_tutorial_list(tutorial_data) {
	return tutorial_data.map((section) => ({
		title: section.title,
		tutorials: section.tutorials.map((tutorial) => ({
			title: tutorial.title,
			slug: tutorial.slug
		}))
	}));
}
