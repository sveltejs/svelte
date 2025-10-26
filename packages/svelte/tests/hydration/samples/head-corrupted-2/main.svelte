<script>
	import Head from './head.svelte';

	let count = $state(1);
</script>

<Head>
	<meta name="count" content={count}>
</Head>
<Head>
	<meta name="count" content={count}>
	<meta name="will-be-missing">
	<meta name="count" content={count}>
</Head>
<Head>
	<meta name="count" content={count}>
</Head>

<button onclick={() => count++}>inc</button>