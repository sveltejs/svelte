<script>
	class Y {
		foo = $state(0);
	}

	let y = $derived(new Y());
</script>

<button onclick={() => y.foo++}>click</button>
<p>{y.foo}</p>
