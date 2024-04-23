<script>
	import App from './App.svelte';
	import { onMount, mount, unmount } from 'svelte';

	export let div;
	onMount(() => {
		const root = div.attachShadow({ mode: 'open' });

		const app = mount(App, {
			target: root
		});

		return () => {
			unmount(app);
		}
	});
</script>

<div bind:this={div}></div>
