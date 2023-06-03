import { DocsMobileNav } from '@sveltejs/site-kit/docs';

export const load = async ({ data, parent }) => {
	const contents = await parent();

	return {
		mobile_nav_start: {
			label: 'Contents',
			icon: 'contents',
			component: DocsMobileNav,
			props: {
				contents: contents.sections,
				pageContents: data.page
			}
		},
		...data
	};
};
