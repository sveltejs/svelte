import { get_example, get_examples_data, get_examples_list } from '$lib/server/examples/index.js';

export const prerender = true;

export async function load() {
	return {
		examples: get_examples_list(get_examples_data())
	};
}
