import { json } from '@sveltejs/kit';
import { get_docs_data, get_docs_list } from '../docs/render';

export const GET = async () => {
	const docs_list = get_docs_list(await get_docs_data());
	const processed_docs_list = docs_list.map(({ title, pages }) => ({
		title,
		sections: pages.map(({ title, path }) => ({ title, path }))
	}));

	return json([
		{
			title: 'Docs',
			prefix: 'docs',
			pathname: '/docs/introduction',
			sections: [
				{
					title: 'DOCS',
					sections: processed_docs_list
				}
			]
		},
		{
			title: 'Status',
			prefix: 'status',
			pathname: '/status'
		}
	]);
};
