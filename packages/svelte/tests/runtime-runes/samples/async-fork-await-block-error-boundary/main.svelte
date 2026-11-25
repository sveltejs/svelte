<script lang="ts">
	import { fork, type Fork } from 'svelte';

	let n = $state(0);
	let current_fork: Fork | undefined;

	const resolvers = new Map<number, { resolve: () => void; reject: (err: Error) => void }>();

	function create_promise(key: number) {
		const deferred = Promise.withResolvers<void>();
		resolvers.set(key, {
			resolve: () => deferred.resolve(),
			reject: (e) => deferred.reject(e)
		});
		return deferred.promise;
	}

	function boom(message: string): string {
		throw new Error(message);
	}

	function settle() {
		resolvers.get(1)?.resolve();
		resolvers.get(101)?.reject(new Error('original'));
		resolvers.get(201)?.reject(new Error('rejection'));
	}
</script>

<button onclick={() => (current_fork = fork(() => n++))}>fork</button>
<button onclick={settle}>settle</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => current_fork?.commit()}>commit</button>

<output>
	<svelte:boundary>
		{#await create_promise(n)}
			<p>loading then</p>
		{:then}
			<p>{boom('then')}</p>
		{/await}
		{#snippet failed(error)}
			<p>failed: {(error as Error).message}</p>
		{/snippet}
	</svelte:boundary>

	<svelte:boundary>
		{#await create_promise(100 + n)}
			<p>loading catch</p>
		{:catch}
			<p>{boom('catch')}</p>
		{/await}
		{#snippet failed(error)}
			<p>failed: {(error as Error).message}</p>
		{/snippet}
	</svelte:boundary>

	<svelte:boundary>
		{#await create_promise(200 + n)}
			<p>loading rejection</p>
		{/await}
		{#snippet failed(error)}
			<p>failed: {(error as Error).message}</p>
		{/snippet}
	</svelte:boundary>
</output>
