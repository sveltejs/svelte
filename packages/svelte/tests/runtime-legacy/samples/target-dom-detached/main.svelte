<script>
	import App from './App.svelte';
	import { onMount, mount, unmount } from 'svelte';

	export let div;

	onMount(() => {
		div = document.createElement('div');

		const app = mount(App, {
			target: div
		});

		return () => {
			unmount(app);
		}
	});
</script>
