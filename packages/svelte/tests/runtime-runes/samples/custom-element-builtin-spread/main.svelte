<script module>
	if (!customElements.get('fancy-button')) {
		customElements.define(
			'fancy-button',
			class extends HTMLButtonElement {
				set label(value) {
					this.textContent = String(value);
				}
			},
			{ extends: 'button' }
		);
	}

	if (!customElements.get('fancy-option')) {
		customElements.define('fancy-option', class extends HTMLOptionElement {}, {
			extends: 'option'
		});
	}
</script>

<script>
	const a = { id: 'a' };
	const b = { id: 'b' };

	let label = $state('one');
	let selected = $state(a);
</script>

<button is="fancy-button" {label}></button>
<button is="fancy-button" {...{ label }}></button>
<button onclick={() => (label = null)}>clear</button>

<select bind:value={selected}>
	<option is="fancy-option" {...{ value: a }}>a</option>
	<option is="fancy-option" {...{ value: b }}>b</option>
</select>
<p>{selected.id}</p>
