<script>
	import App from './App.svelte';
	import { onMount } from 'svelte';

	export let div;

	onMount(() => {
		const app = new App({
			target: div
		});

		return () => {
			app.$destroy();
		}
	});
</script>

<div bind:this={div} />