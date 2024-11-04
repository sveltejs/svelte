<script>
	import { store, themeState } from './theme.svelte.js';

	let i = 0;

	const increment = () => {
		store.update(() => ({ theme: ++i % 2 == 0 ? 'dark' : 'light' }));
	}
</script>

<button onclick={increment}>+</button>

{themeState.value.theme}