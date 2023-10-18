<script>
	class MyCustomElement extends HTMLElement {
		constructor() {
			super();
			this._obj = null;
		}

		set camelCase(obj) {
			this._obj = obj;
			this.render();
		}

		connectedCallback() {
			this.render();
		}

		render() {
			this.innerHTML = 'Hello ' + this._obj.text + '!';
		}
	}

	window.customElements.define('my-custom-element', MyCustomElement);
</script>

<my-custom-element camelCase={{ text: 'World' }} />
