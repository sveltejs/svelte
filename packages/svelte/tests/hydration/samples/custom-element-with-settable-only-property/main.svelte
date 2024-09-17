<script module>
	if (!customElements.get('custom-element-with-settable-only-property')) {
		customElements.define('custom-element-with-settable-only-property', class CustomElement extends HTMLElement {
			set prop(n) {
				this.value = n;
			}

			get prop() {
				// invoking this getter shouldn't make hydration fail
				throw new Error('This value is not gettable');
			}
		});
	}
</script>

<custom-element-with-settable-only-property prop="8"></custom-element-with-settable-only-property>
