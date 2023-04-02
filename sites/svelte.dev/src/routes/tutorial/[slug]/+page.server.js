import { get_parsed_tutorial } from '$lib/server/tutorial';
import { get_tutorial_data, get_tutorial_list } from '$lib/server/tutorial/get-tutorial';
import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	const tutorial_data = get_tutorial_data();
	const tutorials_list = get_tutorial_list(tutorial_data);

	const tutorial = await get_parsed_tutorial(tutorial_data, params.slug);

	if (!tutorial) throw error(404);

	return {
		tutorials_list,
		tutorial,
		slug: params.slug
	};
}
