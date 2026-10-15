<script module>
	import { mount } from 'svelte';
	import Child from './Child.svelte';

	if (!customElements.get('spread-context-element')) {
		customElements.define(
			'spread-context-element',
			class extends HTMLElement {
				static observedAttributes = ['label'];

				set config(_) {
					console.log('config', $effect.tracking());
					this.child ??= mount(Child, { target: this });
				}

				attributeChangedCallback() {
					console.log('label', $effect.tracking());
				}
			}
		);
	}
</script>

<script>
	const config = {};
	let title = $state('a');
</script>

<spread-context-element {...{ config, label: 'x', title }}></spread-context-element>
<button onclick={() => (title += 'a')}>{title}</button>
