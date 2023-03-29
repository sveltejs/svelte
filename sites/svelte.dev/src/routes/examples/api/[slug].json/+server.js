import { get_example } from '$lib/server/examples';
import { get_examples_data } from '$lib/server/examples/get-examples';
import { json } from '@sveltejs/kit';

export const GET = async ({ params }) => {
	return json(get_example(get_examples_data(), params.slug));
};
