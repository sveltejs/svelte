import { get_example, get_examples_list } from '$lib/server/examples/index.js';
import examples_data from '$lib/generated/examples-data.js';

export const prerender = true;

export async function load({ params }) {
	const examples_list = get_examples_list(examples_data);
	const example = get_example(examples_data, params.slug);

	return {
		examples_list,
		example,
		slug: params.slug
	};
}
