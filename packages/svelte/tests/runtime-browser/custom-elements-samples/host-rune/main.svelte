<svelte:options customElement="custom-element" />

<script>
	function greet(greeting) {
		$host().dispatchEvent(new CustomEvent('greeting', { detail: greeting }))
	}
</script>

<button onclick={() => greet('hello')}>say hello</button>
