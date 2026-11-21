<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import { createSubscriber } from 'svelte/reactivity';

	let id = $state(1);
	let offset = $state(0);
	let visible = $state(true);
	let use_derived = $state(true);
	let pending: Fork;
	const subscribers = new Map<number, () => void>();

	function read(id: number) {
		if (!subscribers.has(id)) {
			subscribers.set(
				id,
				createSubscriber(() => {
					console.log(`start ${id}`);
					return () => console.log(`stop ${id}`);
				})
			);
		}
		subscribers.get(id)!();
		return id;
	}

	let value = $derived(read(id + offset));
</script>

<button onclick={() => (pending = fork(() => id++))}>fork</button>
<button onclick={() => pending.discard()}>discard</button>
<button onclick={() => pending.commit()}>commit</button>
<button onclick={() => (offset += 10)}>rebase</button>
<button onclick={() => (use_derived = !use_derived)}>mode</button>
<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	{#if use_derived}
		{#key value}
			<output>{value}</output>
		{/key}
	{:else}
		{#key read(id + offset)}
			<output>{id + offset}</output>
		{/key}
	{/if}
{/if}
