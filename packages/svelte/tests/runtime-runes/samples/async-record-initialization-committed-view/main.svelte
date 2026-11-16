<script lang="ts">
	import Child from './Child.svelte';

	let count = $state(0);
	let waiting = $state(false);
	const first = Promise.withResolvers<string>();
	const gate = Promise.withResolvers<number>();
	const answers = new Map<number, (value: number) => void>();

	function slow(value: number) {
		console.log(value);
		return new Promise<number>((resolve) => answers.set(value, resolve));
	}

	function resolve() {
		for (const [value, fn] of answers) fn(value);
	}
</script>

<button onclick={() => { count = 1; waiting = true; }}>update</button>
<button onclick={() => first.resolve('one')}>first</button>
<button onclick={() => gate.resolve(1)}>finish update</button>
<button onclick={resolve}>resolve</button>

<output>
	<b>{count}</b>
	<svelte:boundary>
		<Child {count} value={first.promise} {slow} />
		{#snippet pending()}<p>pending</p>{/snippet}
	</svelte:boundary>

	{#if waiting}
		<i>{await gate.promise}</i>
	{/if}
</output>
