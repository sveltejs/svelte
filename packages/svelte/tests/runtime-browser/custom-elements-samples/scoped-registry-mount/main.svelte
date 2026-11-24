<svelte:options
	customElement={{
		extend: (customElementConstructor) => {
			registry.define('extended-element', customElementConstructor);
			return customElementConstructor;
		}
	}}
/>

<script module lang="ts">
	class Leaf extends HTMLElement {}

	const registry = new CustomElementRegistry();
	registry.define('x-leaf', Leaf);

	// expose to the test
	Object.assign(window, { scoped_registry: registry, Leaf });
</script>

<script lang="ts">
	let show = $state(false);
</script>

<button onclick={() => (show = true)}>show</button>
<x-leaf class="static"></x-leaf>
{#if show}
	<x-leaf class="conditional"></x-leaf>
{/if}
