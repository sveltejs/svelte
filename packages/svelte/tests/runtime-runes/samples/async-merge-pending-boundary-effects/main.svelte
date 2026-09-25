<script>
	import Child from './Child.svelte';

	let x = $state(0);
	let show = $state(false);
	let resolve_a;
	let resolve_b;

	function delay_a(value) {
		if (value === 0) return 0;
		return new Promise(resolve => { resolve_a = () => resolve(value); });
	}

	function delay_b() {
		return new Promise(resolve => { resolve_b = () => resolve('ready'); });
	}
</script>

<button onclick={() => x = 1}>start A: x = 1</button>
<button onclick={() => show = true}>start B: show boundary</button>
<button onclick={() => resolve_a()}>resolve A</button>
<button onclick={() => resolve_b()}>resolve boundary</button>
<button onclick={() => { show = false; x = 0; }}>reset</button>

<p>{await delay_a(x)}</p>
{#if show && x > 0}
	<svelte:boundary>
		{#snippet pending()}<span>pending</span>{/snippet}
		<Child delay={delay_b} />
	</svelte:boundary>
{/if}
