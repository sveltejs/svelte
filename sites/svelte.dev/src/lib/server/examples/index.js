/**
 * @param {import('./types').ExamplesData} examples_data
 * @param {string} slug
 */
export function get_example(examples_data, slug) {
	const example = examples_data
		.find((section) => section.examples.find((example) => example.slug === slug))
		?.examples.find((example) => example.slug === slug);

	return example;
}
