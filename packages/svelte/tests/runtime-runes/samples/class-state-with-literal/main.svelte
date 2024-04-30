<script>
	class Toggle {
		"aria-pressed" = $state(false);

		toggle(){
			this["aria-pressed"] = !this["aria-pressed"]
		}
	}
	const toggle = new Toggle();
</script>

<button on:click={() => toggle.toggle()}>{toggle["aria-pressed"]}</button>
