import { render_markdown } from '../markdown/renderer';

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
		content: await render_markdown(`tutorial/${tutorial.dir}`, tutorial.content)
	};
}
