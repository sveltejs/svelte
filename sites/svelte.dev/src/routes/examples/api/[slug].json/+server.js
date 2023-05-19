import examples_data from '$lib/generated/examples-data.js';
import { get_example, get_examples_list } from '$lib/server/examples/index.js';
import { error, json } from '@sveltejs/kit';

export const prerender = true;

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

export async function entries() {
	const examples_list = get_examples_list(examples_data);

	return examples_list
		.map(({ examples }) => examples)
		.flatMap((val) => val.map(({ slug }) => ({ slug })));
}
