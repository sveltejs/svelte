<script>
	import App from './App.svelte';
	import { onMount } from 'svelte';

	export let div;

	onMount(() => {
		div = document.createElement('div');

		const app = new App({
			target: div
		});

		return () => {
			app.$destroy();
		}
	});
</script>
