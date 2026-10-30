<script>
	let x = $state(0);
	let show = $state(false);
	let done;

	function delay(value) {
		if (value === 0) return 0;
		return new Promise(resolve => { done = () => resolve(value); });
	}

	let result = $derived(await delay(x));
</script>

<button onclick={() => x = 1}>start A: x = 1</button>
<button onclick={() => show = true}>start B: show branch</button>
<button onclick={() => done()}>resolve A</button>

<p>{x}/{result}</p>
{#if show && x > 0 && result > 0}
	<strong>ready</strong>
{/if}
{#if x > 0 && show && result > 0}
	<em>also ready</em>
{/if}
