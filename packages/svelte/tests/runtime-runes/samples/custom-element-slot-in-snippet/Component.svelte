<script module>
	if (!customElements.get('my-custom-element')) {
		customElements.define('my-custom-element', class extends HTMLElement {
			connectedCallback() {
				this.attachShadow({ mode: 'open' });
				this.shadowRoot.innerHTML = '|<slot></slot>|<slot name="slot"></slot>|';
			}
		});
	}
</script>

<script>
	const { children } = $props();
</script>

<my-custom-element>
	{@render children()}
</my-custom-element>
