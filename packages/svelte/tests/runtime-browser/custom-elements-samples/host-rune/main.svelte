<svelte:options customElement="custom-element" />

<script>
	function greet(greeting) {
		$host().dispatchEvent(new CustomEvent('greeting', { detail: greeting }))
	}

	function welcome() {
		$host().dispatchEvent(new CustomEvent('greeting', { detail: 'welcome' }))
	}
	function bonjour() {
		const element = $host();
		element.dispatchEvent(new CustomEvent('greeting', { detail: 'bonjour' }))
	}
</script>

<button onclick={() => greet('hello')}>say hello</button>
<button onclick={welcome}>say welcome</button>
<button onclick={bonjour}>say bonjour</button>
