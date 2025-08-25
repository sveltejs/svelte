<script module>
	if(!customElements.get('value-element')) {
		customElements.define('value-element', class extends HTMLElement {

			constructor() {
				super();
				this.attachShadow({ mode: 'open' });
			}

			set value(v) {
				if (this.__value !== v) {
					this.__value = v;
					this.shadowRoot.innerHTML = `<span>${v}</span>`;
				}
			}
		});
	}
	if(!customElements.get('value-builtin')) {
		customElements.define('value-builtin', class extends HTMLDivElement {

			constructor() {
				super();
				this.attachShadow({ mode: 'open' });
			}

			set value(v) {
				if (this.__value !== v) {
					this.__value = v;
					this.shadowRoot.innerHTML = `<span>${v}</span>`;
				}
			}
		}, {
			extends: 'div'
		});
	}
</script>

<my-element string="test" object={{ test: true }}></my-element>
<a is="my-link" string="test" object={{ test: true }}></a>

<value-element value="test"></value-element>
<value-element {...{value: "test"}}></value-element>
<div is="value-builtin" value="test"></div>
