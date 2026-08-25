<script>
	class MyCustomElement extends HTMLElement {
		constructor() {
			super();
			this._foo = null;
			this._bar = null;
		}

		/**
		 * @param {string} foo
		 */
		set foo(foo) {
			this._foo = foo;
			this.render();
		}

		/**
		 * @param {string} foo
		 */
		set bar(bar) {
			this._bar = bar;
			this.render();
		}

		connectedCallback() {
			this.render();
		}

		render() {
			this.innerHTML = "Hello " + this._foo + this._bar + "!";
		}
	}

	if (!customElements.get('async-custom-element')) {
		customElements.define("async-custom-element", MyCustomElement);
	}

	const foo = $derived(await "foo");
</script>

<async-custom-element {foo} bar={await 'bar'}></async-custom-element>
