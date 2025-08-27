<script>
	import { tick } from 'svelte';
	import A from './A.svelte';
	import B from './B.svelte';

	const { promise: main_promise, resolve: main_resolve } = Promise.withResolvers();
	const { promise: a_promise, resolve: a_resolve } = Promise.withResolvers();
	const { promise: b_promise, resolve: b_resolve } = Promise.withResolvers();

	// regardless of resolution order, title should be the result of B, because it's the last-encountered
	tick().then(() => {
		main_resolve(true);
		tick().then(() => {
			b_resolve(true);
		}).then(() => {
			a_resolve(true);
		});
	})
</script>

<svelte:head>
	{#if await main_promise}
		<title>Main</title>
	{/if}
</svelte:head>
<A promise={a_promise}/>
<B promise={b_promise}/>
