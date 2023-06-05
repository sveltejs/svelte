import { DocsMobileNav } from '@sveltejs/site-kit/docs';

export async function load({ data }) {
	return {
		nav_context_menus: {
			docs: {
				component: DocsMobileNav,
				props: {
					contents: data.nav_context_list.docs.contents,
					pageContents: data.nav_context_list.docs.pageContents
				}
			}
		},
		...data
	};
}
