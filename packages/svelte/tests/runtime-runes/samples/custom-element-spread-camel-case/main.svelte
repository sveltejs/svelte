<script module>
	if (!customElements.get('camel-case-element')) {
		customElements.define(
			'camel-case-element',
			class extends HTMLElement {
				set camelCase(v) {
					this.__camel_case = v;
				}
			}
		);
	}
</script>

<camel-case-element {...{ camelCase: { test: true } }}></camel-case-element>
