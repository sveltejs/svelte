<svelte:options customElement="child-element" />

<script>
	$effect(() => {
		$host().dispatchEvent(new CustomEvent('change', { bubbles: true }));
	});
</script>
