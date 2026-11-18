<script>
	import Child from './Child.svelte';

	let resolve;
	const promise = new Promise((fulfil) => (resolve = fulfil));

	export function finish() {
		resolve('done');
	}
</script>

<custom>
	<svelte:boundary>
		<p>{await promise}</p>
		<Child message="hello"></Child>

		{#snippet pending()}
			<p>loading</p>
		{/snippet}
	</svelte:boundary>
</custom>
