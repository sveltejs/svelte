<script>
	import { getAbortSignal } from 'svelte';

	let deferred = $state(Promise.withResolvers());

	function load(deferred) {
		const signal = getAbortSignal();

		return new Promise((fulfil, reject) => {
			signal.onabort = (e) => {
				console.log('aborted');
				reject(e.currentTarget.reason);
			};

			deferred.promise.then(fulfil, reject);
		});
	}
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve('hello')}>resolve</button>

<svelte:boundary>
	<h1>{await load(deferred)}</h1>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
