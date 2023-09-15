import { browser } from '$app/environment';

export function load({ data, url }) {
	// initialize vim with the search param
	const vim_search_params = url.searchParams.get('vim');
	let vim = vim_search_params !== null && vim_search_params !== 'false';
	// when in the browser check if there's a local storage entry and eventually override
	// vim if there's not a search params otherwise update the local storage
	if (browser) {
		const vim_local_storage = window.localStorage.getItem('svelte:vim-enabled');
		if (vim_search_params !== null) {
			window.localStorage.setItem('svelte:vim-enabled', vim.toString());
		} else if (vim_local_storage) {
			vim = vim_local_storage !== 'false';
		}
	}
	return { ...data, vim };
}
