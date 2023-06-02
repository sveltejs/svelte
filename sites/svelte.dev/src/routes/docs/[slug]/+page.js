import { DocsMobileNav } from '@sveltejs/site-kit/docs';

export const load = async ({ data, parent }) => {
	const contents = await parent();

	return {
		secondary_nav: {
			component: DocsMobileNav,
			props: {
				contents: contents.sections,
				pageContents: data.page
			},
			height: '48px'
		},
		...data
	};
};
