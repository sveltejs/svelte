<script>
	class MyCustomElement extends HTMLElement {
		constructor() {
			super();
			this._obj = null;
			this._text = null;
		}

		set text(text) {
			this._text = text;
			this.render();
		}

		set camelCase(obj) {
			this._obj = obj;
			this.render();
		}

		connectedCallback() {
			this.render();
		}

		render() {
			this.innerHTML = 'Hello ' + this._obj.text + this._text;
		}
	}

	class Extended extends MyCustomElement {}

	window.customElements.define('my-custom-element', Extended);
</script>

<my-custom-element camelCase={{ text: 'World' }} text="!" />
