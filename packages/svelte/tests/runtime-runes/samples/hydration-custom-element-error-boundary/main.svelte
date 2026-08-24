<script module>
	if (!customElements.get('throwing-element')) {
		customElements.define(
			'throwing-element',
			class extends HTMLElement {
				set value(_) {
					throw new Error('setter error');
				}
			}
		);
	}
</script>

<svelte:boundary>
	<throwing-element {...{ value: 'boom' }}></throwing-element>

	{#snippet failed(error)}
		<p>failed: {error.message}</p>
	{/snippet}
</svelte:boundary>

<p>after</p>
