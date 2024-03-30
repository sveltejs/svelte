import { is_array } from '../utils.js';

/** @param {string} html */
export function create_fragment_from_html(html) {
	var elem = document.createElement('template');
	elem.innerHTML = html;
	return elem.content;
}

/**
 * @param {import('#client').Dom} current
 */
export function remove(current) {
	if (is_array(current)) {
		for (var i = 0; i < current.length; i++) {
			var node = current[i];
			if (node.isConnected) {
				node.remove();
			}
		}
	} else if (current.isConnected) {
		current.remove();
	}
}
