import { get_example } from '$lib/server/examples';
import { get_examples_data, get_examples_list } from '$lib/server/examples/get-examples';

export const prerender = true;

const examples = [
	{
		id: 'hello-world',
		title: 'Hello World',
		description: 'Svelte components are built on top of HTML. Just add data.',
	},
	{
		id: 'nested-components',
		title: 'Scoped CSS',
		description:
			'CSS is component-scoped by default — no more style collisions or specificity wars. Or you can <a href="/blog/svelte-css-in-js">use your favourite CSS-in-JS library</a >.',
	},
	{
		id: 'reactive-assignments',
		title: 'Reactivity',
		description:
			'Trigger efficient, granular updates by assigning to local variables. The compiler does the rest.',
	},
	{
		id: 'svg-transitions',
		title: 'Transitions',
		description:
			'Build beautiful UIs with a powerful, performant transition engine built right into the framework.',
	},
];

export const load = () => {
	const examples_data = get_examples_data();

	return {
		examples: examples.map(({ description, id, title }) => ({
			id,
			title,
			description,
			files: get_example(examples_data, id).files,
		})),
	};
};
