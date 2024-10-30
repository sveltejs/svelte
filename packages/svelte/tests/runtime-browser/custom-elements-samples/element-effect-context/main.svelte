<svelte:options customElement="my-app" />

<script module>
	class Tracking extends HTMLElement {
		static observedAttributes = ["count"];
        tracking = false;

        set count(_) {
            this.tracking = $effect.tracking();
            this.render();
        }

        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }

		render() {
			this.shadowRoot.innerHTML = `<p>${this.tracking}</p>`;
		}
	}

	customElements.define("my-tracking", Tracking);
</script>

<script>
    let count = $state(0);
</script>

<button onclick={() => (count += 1)}>{count}</button>
<my-tracking {count}></my-tracking>
