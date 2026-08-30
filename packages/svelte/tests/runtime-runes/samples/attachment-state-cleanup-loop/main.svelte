<script>
	let visible = $state(false);
	let element = $state();

	function attachment(node) {
		element = node;
		element.dataset.attached = 'true';

		return () => {
			if (element === node) {
				element = undefined;
			}
		};
	}
</script>

<button onclick={() => (visible = true)}>show</button>

{#if visible}
	<div {@attach attachment}>content</div>
{/if}
