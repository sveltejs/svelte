<script>
	import HeadNested from './HeadNested.svelte';
	import Nested from './Nested.svelte';
</script>

<svelte:head>
	<!-- the if block forces a comment node; tests that the nested head starts at the correct node -->
	{#if true}
		{@html '<meta name="main_html" content="main_html">'}
		<meta name="main" content="main" />
		<HeadNested />
	{/if}
</svelte:head>

<Nested />
