<script>
	import Foo from './Foo.svelte';
	let bar;
</script>

<svelte:head>
	<link rel="canonical" href="/test" />
	<meta name="description" content="test" />
</svelte:head>

<Foo bind:bar />
