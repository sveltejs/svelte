<script>
	class Counter {
		"aria-pressed" = $state(false);

		toggle(){
			this["aria-pressed"] = !this["aria-pressed"]
		}
	}
	const toggle = new Counter();
</script>

<button on:click={() => toggle.toggle()}>{toggle["aria-pressed"]}</button>
