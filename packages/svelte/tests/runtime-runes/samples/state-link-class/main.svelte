<script>
	class Instance {
		a = $state(0);
		b = $state.link(this.a);
	}

	const instance = new Instance();
</script>

<button onclick={() => instance.a++}>{instance.a}</button>
<button onclick={() => instance.b++}>{instance.b}</button>
