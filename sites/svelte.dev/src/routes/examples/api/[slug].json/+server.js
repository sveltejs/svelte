import examples_data from '$lib/generated/examples-data.js';
import { get_example } from '$lib/server/examples';
import { get_examples_list } from '$lib/server/examples/get-examples';
import { error, json } from '@sveltejs/kit';

export const GET = ({ params }) => {
	const examples = new Set(
		get_examples_list(examples_data)
			.map((category) => category.examples)
			.flat()
			.map((example) => example.slug)
	);

	if (!examples.has(params.slug)) throw error(404, 'Example not found');

	return json(get_example(examples_data, params.slug));
};
