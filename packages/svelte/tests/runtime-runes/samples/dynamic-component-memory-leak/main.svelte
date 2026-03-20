<script>
	import Home from './Home.svelte';
	import About from './About.svelte';
	let { page = 'Home' } = $props();

	const components = { Home, About };
	let Component = $derived(components[page]);
</script>

<Component />
