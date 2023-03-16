<script>
	let foo = false
	let bar = [false];
</script>

<button on:click={() => foo = !foo}>
	Toggle foo
</button>
<button on:click={() => bar[0] = !bar[0]}>
	Toggle bar
</button>

<hr>
{@html `foo: ${foo}, bar: ${bar.every(x => x)}`}
<hr>

{#if foo}
	foo!
{:else if bar.every(x => x)}
	bar!
{/if}