<script>
	class CustomElement extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
			this.shadowRoot.innerHTML = '<button>click me</button>';
			// Looks weird, but some custom element implementations actually do this
			// to prevent unwanted side upwards event propagation
			this.addEventListener('click', (e) => e.stopPropagation());
		}
	}

	customElements.define('custom-element', CustomElement);
</script>

<div onclick={() => console.log('bubbled beyond shadow root')}>
	<custom-element onclick={() => console.log('reached shadow root1')}></custom-element>
	<custom-element {...{onclick:() => console.log('reached shadow root2')}}></custom-element>
</div>
