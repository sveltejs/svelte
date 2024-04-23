<script>
	let container;
	function tooltip(node, text) {
		let tooltip = null;

		function onVisibilityChange() {
			tooltip = document.createElement('div');
			tooltip.classList.add('tooltip');
			tooltip.textContent = text;
			container.appendChild(tooltip);
		}

		node.addEventListener('visibilitychange', onVisibilityChange);

		return {
			destroy() {
				node.removeEventListener('visibilitychange', onVisibilityChange);
			}
		}
	}
</script>

<svelte:document use:tooltip="{'Perform an Action'}" />
<div bind:this={container}></div>
