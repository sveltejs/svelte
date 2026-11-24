<script lang="ts">
	import Child from './Child.svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);
	let gated = $state(false);
	const gate = Promise.withResolvers<number>();
	const answers = new Map<number, PromiseWithResolvers<number>>();

	function load(value: number) {
		const d = Promise.withResolvers<number>();
		answers.set(value, d);
		return d.promise;
	}
</script>

<button onclick={() => { a = true; x = 1; gated = true; }}>start</button>
<button onclick={() => { b = true; x = 2; }}>update</button>
<button onclick={() => { a = false; }}>hide</button>
<button onclick={() => answers.get(2)!.reject(new Error('later'))}>reject</button>
<button onclick={() => answers.get(1)!.resolve(1)}>resolve</button>
<button onclick={() => gate.resolve(1)}>finish</button>

<output>
	<p>{gated ? await gate.promise : 0}</p>
	<svelte:boundary>
		{#if b || a}<Child {x} {load} />{/if}
		{#snippet failed(error)}<p>failed: {(error as Error).message}</p>{/snippet}
	</svelte:boundary>
</output>
