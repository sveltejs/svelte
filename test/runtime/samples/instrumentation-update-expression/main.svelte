<script>
	let foo = 0;
	let bar = { bar: 0 };
</script>

<p>{foo}</p>

<button on:click={() => foo++}>foo++</button>
<button on:click={() => ++foo}>++foo</button>

<p>{bar.bar}</p>

<button on:click={() => bar.bar++}>bar.bar++</button>
<button on:click={() => ++bar.bar}>++bar.bar</button>
