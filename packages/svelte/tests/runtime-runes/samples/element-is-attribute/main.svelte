<script lang="ts" context="module">
	if (!customElements.get('x-button')) {
		class XButton extends HTMLButtonElement {
			connectedCallback() {
				this.addEventListener('click', () => console.log('works'));
			}
		}

		customElements.define('x-button', XButton, { extends: 'button' });
	}
</script>

<script lang="ts">
	let { ...props } = $props();
</script>

<button is="x-button">click me</button>
<button {...props} is="x-button">click me</button>
