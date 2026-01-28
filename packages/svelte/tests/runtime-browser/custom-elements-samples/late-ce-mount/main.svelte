<svelte:options customElement="custom-element" />

<script lang="ts">
	import { onMount } from 'svelte';

	class CustomElement extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
			Object.defineProperty(this, 'property', {
				set: (value) => {
					this.shadowRoot.innerHTML = typeof value + '|' + JSON.stringify(value);
				}
			});
		}
	}

	onMount(async () => {
		customElements.define('set-property-before-mounted', CustomElement);
	});

	let property = $state();
</script>

<button onclick={() => (property = { foo: 'bar' })}>Update</button>
<!-- one that's there before it's registered -->
<set-property-before-mounted {property}></set-property-before-mounted>
<!-- and one that's after registration but sets property to an object right away -->
{#if property}
	<set-property-before-mounted {property}></set-property-before-mounted>
{/if}
