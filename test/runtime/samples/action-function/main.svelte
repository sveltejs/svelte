<script>
	const translations = {
		perform_action: 'Perform an Action'
	};

	function t(key) {
		return translations[key] || `{{${key}}}`;
	}

	export let actionTransKey = 'perform_action';

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
			destroy() {
				node.removeEventListener('mouseenter', onMouseEnter);
				node.removeEventListener('mouseleave', onMouseLeave);
			}
		}
	}
</script>

<button use:tooltip="{t(actionTransKey)}">action</button>