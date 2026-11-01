<script>
	import Layout from './Layout.svelte';
	import Page from './Page.svelte';

	let { constructors = [Layout, Page] } = $props();
	const L = constructors[0];
	const P = constructors[1];
</script>

<L><P /></L>
