export function longpress(node) {
	const handleMousedown = () => {
		setTimeout(() => {
			node.dispatchEvent(
				new CustomEvent('longpress')
			);
		}, 500);
	};

	node.addEventListener('mousedown', handleMousedown);

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMousedown);
		}
	};
}