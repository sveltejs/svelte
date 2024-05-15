<script>
	let container;
	function tooltip(node, text) {
		let tooltip = null;

		function onMouseEnter() {
			tooltip = document.createElement('div');
			tooltip.classList.add('tooltip');
			tooltip.textContent = text;
			container.appendChild(tooltip);
		}

		function onMouseLeave() {
			if (!tooltip) return;
			tooltip.remove();
			tooltip = null;
		}

		node.addEventListener('mouseenter', onMouseEnter);
		node.addEventListener('mouseleave', onMouseLeave);

		return {
			destroy() {
				node.removeEventListener('mouseenter', onMouseEnter);
				node.removeEventListener('mouseleave', onMouseLeave);
			}
		}
	}
</script>

<svelte:body use:tooltip="{'Perform an Action'}" />
<div bind:this={container}></div>
