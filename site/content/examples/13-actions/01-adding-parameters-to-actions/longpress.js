export function longpress(node, duration) {
	const handleMousedown = () => {
		setTimeout(() => {
			node.dispatchEvent(
				new CustomEvent('longpress')
			);
		}, duration);
	};

	node.addEventListener('mousedown', handleMousedown);

	return {
		update(newDuration) {
			duration = newDuration;
		},
		destroy() {
			node.removeEventListener('mousedown', handleMousedown);
		}
	};
}