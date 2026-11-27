<script module lang="ts">
	// a custom element that wasn't created with Svelte
	if (typeof customElements !== 'undefined' && !customElements.get('x-toggle')) {
		customElements.define(
			'x-toggle',
			class extends HTMLElement {
				#pressed = false;

				get isPressed() {
					return this.#pressed;
				}

				set isPressed(value) {
					this.#pressed = value;
					this.textContent = value ? 'on' : 'off';
				}

				toggle() {
					this.isPressed = !this.isPressed;
					this.dispatchEvent(new Event('isPressedchange'));
				}
			}
		);
	}
</script>

<script lang="ts">
	let pressed = $state(false);
</script>

<x-toggle bind:isPressed={pressed}></x-toggle>
<button onclick={() => (pressed = !pressed)}>toggle</button>
<output>{pressed}</output>
