<svelte:options customRenderer={null} />

<script>
	import Child from './Child.svelte';

	let resolve;
	const promise = new Promise((fulfil) => (resolve = fulfil));

	export function finish() {
		resolve('done');
	}
</script>

<svelte:boundary>
	<p>{await promise}</p>
	<Child message="hello"></Child>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>
