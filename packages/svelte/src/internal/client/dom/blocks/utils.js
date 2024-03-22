import { current_block } from '../../runtime.js';

/** @returns {import('#client').NormalBlock} */
export function create_block() {
	return {
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('#client').Block} */ (current_block)
	};
}
