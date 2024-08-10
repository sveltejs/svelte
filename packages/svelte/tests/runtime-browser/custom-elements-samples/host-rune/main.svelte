<svelte:options customElement="custom-element" />

<script>
	function greet(greeting) {
		$host().dispatchEvent(new CustomEvent('greeting', { detail: greeting }))
	}

	function welcome() {
		$host().dispatchEvent(new CustomEvent('greeting', { detail: 'welcome' }))
	}
</script>

<button onclick={() => greet('hello')}>say hello</button>
<button onclick={welcome}>say welcome</button>
