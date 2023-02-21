<script>
	import HeadNested from './HeadNested.svelte';
	import Nested from './Nested.svelte';
</script>

<svelte:head>
	{@html '<meta name="main_html" content="main_html">'}
	<meta name="main" content="main">
	<HeadNested />
</svelte:head>

<Nested/>
