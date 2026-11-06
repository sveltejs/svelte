<script>
	import { fork } from 'svelte';

	let a = $state(1);
	let b = $state(1);
	let condition = $state(false);

	let foo = $derived(condition ? a : b);

	let traced = $derived.by(() => {
		$inspect.trace('traced');
		return foo;
	});
</script>

<button onclick={() => fork(() => (condition = true))}>fork</button>
<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>

{#if traced}
	<p>{traced}</p>
{/if}
