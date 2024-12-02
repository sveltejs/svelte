<script lang="ts">
	let bounds: DOMRect | undefined = $state();

	const openDropdown = () => {
    bounds = getInputPosition();
  };

	const getInputPosition = () => {};
  const calculatePosition = (boundary?: DOMRect) => ({});
	let position = $derived(calculatePosition(bounds));
</script>

<div style:top={position.top}></div>