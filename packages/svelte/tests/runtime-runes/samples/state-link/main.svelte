<script>
	class Instance {
		a = $state(0);
		b = $state.link(this.a)
	}

	const instance = new Instance();
</script>

<input type="number" bind:value={instance.a} />
<input type="number" bind:value={instance.b} />

<div>{instance.a}</div>
<div>{instance.b}</div>

<button onclick={() => {
	instance.b++;
}}>i+</button>
