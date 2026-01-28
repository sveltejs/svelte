<script lang="ts">
	let bounds: DOMRect | undefined;
	$: position = calculatePosition(bounds);

	const openDropdown = () => {
    bounds = getInputPosition();
  };

	const getInputPosition = () => {};
  const calculatePosition = (boundary?: DOMRect) => ({});
</script>

<div style:top={position.top}></div>
