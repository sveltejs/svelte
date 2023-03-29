// @ts-check
import adapter from '@sveltejs/adapter-auto';
import {
	get_tutorial_data,
	get_tutorial_list,
} from './src/lib/server/tutorial/get-tutorial-data.js';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		prerender: {
			// TODO: REMOVE
			handleMissingId: 'ignore',
			entries: [
				'*',
				...get_tutorial_list(get_tutorial_data()).flatMap(({ tutorials }) =>
					tutorials.map((tutorial) => /** @type {`/${string}`} */ ('/tutorial/' + tutorial.slug))
				),
			],
		},
	},
};
