import { get_example, get_examples_data, get_examples_list } from '$lib/server/examples/index.js';

export const prerender = true;

export async function load({ params }) {
	const examples_data = get_examples_data();

	const examples_list = get_examples_list(examples_data);
	const example = get_example(examples_data, params.slug);

	return {
		examples_list,
		example,
		slug: params.slug
	};
}
