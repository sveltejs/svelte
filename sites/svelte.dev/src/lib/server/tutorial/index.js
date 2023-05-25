import { modules } from '$lib/generated/type-info';
import fs from 'node:fs';
import { CONTENT_BASE_PATHS } from '../../../constants.js';
import { extract_frontmatter } from '../markdown/index.js';
import { render_markdown } from '../markdown/renderer.js';

/**
 * @param {import('./types').TutorialData} tutorial_data
 * @param {string} slug
 */
export async function get_parsed_tutorial(tutorial_data, slug) {
	const tutorial = tutorial_data
		.find(({ tutorials }) => tutorials.find((t) => t.slug === slug))
		?.tutorials?.find((t) => t.slug === slug);

	if (!tutorial) return null;

	return {
		...tutorial,
		content: await render_markdown(`tutorial/${tutorial.dir}`, tutorial.content, { modules })
	};
}

/**
 * @returns {import('./types').TutorialData}
 */
export function get_tutorial_data(base = CONTENT_BASE_PATHS.TUTORIAL) {
	const tutorials = [];

	for (const subdir of fs.readdirSync(base)) {
		const section = {
			title: '', // Initialise with empty
			slug: subdir.split('-').slice(1).join('-'),
			tutorials: []
		};

		if (!(fs.statSync(`${base}/${subdir}`).isDirectory() || subdir.endsWith('meta.json'))) continue;

		if (!subdir.endsWith('meta.json'))
			section.title = JSON.parse(fs.readFileSync(`${base}/${subdir}/meta.json`, 'utf-8')).title;

		for (const section_dir of fs.readdirSync(`${base}/${subdir}`)) {
			const match = /\d{2}-(.+)/.exec(section_dir);
			if (!match) continue;

			const slug = match[1];

			const tutorial_base_dir = `${base}/${subdir}/${section_dir}`;

			// Read the file, get frontmatter
			const contents = fs.readFileSync(`${tutorial_base_dir}/text.md`, 'utf-8');
			const { metadata, body } = extract_frontmatter(contents);

			// Get the contents of the apps.
			const completion_states_data = { initial: [], complete: [] };
			for (const app_dir of fs.readdirSync(tutorial_base_dir)) {
				if (!app_dir.startsWith('app-')) continue;

				const app_dir_path = `${tutorial_base_dir}/${app_dir}`;
				const app_contents = fs.readdirSync(app_dir_path, 'utf-8');

				for (const file of app_contents) {
					completion_states_data[app_dir === 'app-a' ? 'initial' : 'complete'].push({
						name: file,
						type: file.split('.').at(-1),
						content: fs.readFileSync(`${app_dir_path}/${file}`, 'utf-8')
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
