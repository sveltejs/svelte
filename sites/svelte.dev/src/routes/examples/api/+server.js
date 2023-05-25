// @ts-check
import examples_data from '$lib/generated/examples-data.js';
import { get_examples_list } from '$lib/server/examples/index.js';
import { json } from '@sveltejs/kit';

export const GET = () => {
	return json(get_examples_list(examples_data));
};
