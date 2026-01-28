import { fromStore, writable } from 'svelte/store';

export const store = writable({ theme: 'dark' });

class ThemeState {
	#storeState = fromStore(store);
	value = $derived(this.#storeState.current);

	constructor() {
		$effect.root(() => {
			$effect(() => {
				console.log(this.value.theme);
			});
		});
	}
}

export const themeState = new ThemeState();
