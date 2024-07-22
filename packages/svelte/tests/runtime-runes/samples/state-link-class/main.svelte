<script>
	let a = $state(0);
	let b = $state.link(a);
</script>

<input type="number" bind:value={a} />
<input type="number" bind:value={b} />

<div>{a}</div>
<div>{b}</div>

<button onclick={() => {
	b++;
}}>i+</button>
