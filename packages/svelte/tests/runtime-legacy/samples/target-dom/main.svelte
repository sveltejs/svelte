<script>
	import App from './App.svelte';
	import { onMount, mount, unmount } from 'svelte';

	export let div;

	onMount(() => {
		const app = mount(App, {
			target: div
		});

		return () => {
			unmount(app);
		}
	});
</script>

<div bind:this={div} />
