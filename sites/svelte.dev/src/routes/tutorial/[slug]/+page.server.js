import { get_parsed_tutorial } from '$lib/server/tutorial';
import { get_tutorial_data, get_tutorial_list } from '$lib/server/tutorial/get-tutorial-data';
import { error } from '@sveltejs/kit';
import fs from 'fs';

const base = '../../site/content/tutorial/';

export async function load({ params }) {
	const tutorial_data = get_tutorial_data();
	const tutorials_list = get_tutorial_list(tutorial_data);

	const tutorial = get_parsed_tutorial(tutorial_data, params.slug);

	return {
		tutorials_list,
		tutorial,
		slug: params.slug,
	};
	// throw error(404);
}
