<script>
	class MyCustomElement extends HTMLElement {
		constructor() {
			super();
			this._name = null;
		}

		/**
		 * @param {string} name
		 */
		set name(name) {
			this._name = name;
			this.render();
		}

		connectedCallback() {
			this.render();
		}

		render() {
			this.innerHTML = "Hello " + this._name + "!";
		}
	}

	window.customElements.define("my-custom-element", MyCustomElement);

	export let tag;
	export let name;
</script>

<svelte:element this="{tag}" {name} id="a" />
<my-custom-element {name} id="b" />
