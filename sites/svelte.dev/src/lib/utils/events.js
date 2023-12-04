/** @param {number} code */
export function keyEvent(code) {
	/**
	 * @param {HTMLInputElement} node
	 * @param {(event: KeyboardEvent) => void} callback
	 */
	return function (node, callback) {
		node.addEventListener('keydown', handleKeydown);

		/** @param {KeyboardEvent} event */
		function handleKeydown(event) {
			if (event.keyCode === code) {
				callback.call(this, event);
			}
		}

		return {
			destroy() {
				node.removeEventListener('keydown', handleKeydown);
			}
		};
	};
}

export const enter = keyEvent(13);
