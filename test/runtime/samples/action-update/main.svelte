<script>
	export let text = 'Perform an Action';

	function checkForCtrl(event) {
		if (event.ctrlKey) {
			text = 'Perform an augmented Action';
		} else {
			text = 'Perform an Action';
		}
	}

	function tooltip(node, text) {
		let tooltip = null;

		function onMouseEnter() {
			tooltip = document.createElement('div');
			tooltip.classList.add('tooltip');
			tooltip.textContent = text;
			node.parentNode.appendChild(tooltip);
		}

		function onMouseLeave() {
			if (!tooltip) return;
			tooltip.remove();
			tooltip = null;
		}

		node.addEventListener('mouseenter', onMouseEnter);
		node.addEventListener('mouseleave', onMouseLeave);

		return {
			update(text) {
				if (tooltip) tooltip.textContent = text;
			},
			destroy() {
				node.removeEventListener('mouseenter', onMouseEnter);
				node.removeEventListener('mouseleave', onMouseLeave);
			}
		}
	}
</script>

<button use:tooltip="{text}">action</button>
<svelte:window on:keydown="{checkForCtrl}" on:keyup="{checkForCtrl}"/>