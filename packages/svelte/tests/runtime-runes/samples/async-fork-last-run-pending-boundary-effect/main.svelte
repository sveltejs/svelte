<script lang="ts">
	import { fork } from 'svelte';
	import Effect from './Effect.svelte';

	let x = $state(0);
	let f: ReturnType<typeof fork>;

	const queue: Array<() => void> = [];

	function push(v: number) {
		const d = Promise.withResolvers<number>();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => x++))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<output>
	<svelte:boundary>
		<Effect />
		<p>{await push(x)}</p>

		{#snippet pending()}
			<p>pending</p>
		{/snippet}
	</svelte:boundary>
</output>
