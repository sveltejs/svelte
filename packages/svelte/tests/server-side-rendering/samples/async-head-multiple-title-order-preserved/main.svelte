<script>
	import { tick } from 'svelte';
	import A from './A.svelte';
	import B from './B.svelte';

	const main = Promise.withResolvers();
	const a = Promise.withResolvers();
	const b = Promise.withResolvers();

	// regardless of resolution order, title should be the result of B, because it's the last-encountered
	tick().then(() => {
		main.resolve(true);
		tick().then(() => {
			b.resolve(true);
		}).then(() => {
			a.resolve(true);
		});
	})
</script>

<svelte:head>
	{#if await main.promise}
		<title>Main</title>
	{/if}
</svelte:head>
<A promise={a.promise}/>
<B promise={b.promise}/>
