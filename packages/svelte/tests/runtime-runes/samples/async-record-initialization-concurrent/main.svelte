<script lang="ts">
	import Child from './Child.svelte';

	let count = $state(0);
	let waiting = $state(false);
	const first = Promise.withResolvers<string>();
	const background = Promise.withResolvers<number>();
	const answers = new Map<number, (value: number) => void>();

	function slow(value: number) {
		console.log(value);
		return new Promise<number>((resolve) => answers.set(value, resolve));
	}
</script>

<button onclick={() => (waiting = true)}>background</button>
<button onclick={() => first.resolve('one')}>first</button>
<button onclick={() => count++}>bump</button>
<button onclick={() => answers.get(0)!(0)}>resolve old</button>
<button onclick={() => answers.get(1)!(1)}>resolve latest</button>
<button onclick={() => background.resolve(1)}>finish background</button>

<output>
	<svelte:boundary>
		<Child {count} value={first.promise} {slow} />
		{#snippet pending()}<p>pending</p>{/snippet}
	</svelte:boundary>

	{#if waiting}
		<i>{await background.promise}</i>
	{/if}
</output>
