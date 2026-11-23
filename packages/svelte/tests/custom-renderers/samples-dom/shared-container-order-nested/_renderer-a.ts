import { create_test_renderer } from '../../renderer.js';
import { shared_connection } from '../../renderer-shared-order.js';

const renderer_a = create_test_renderer({ cross: false });
export const scene_a = renderer_a.createFragment();

renderer_a.embed = shared_connection(scene_a, 'ab', (key) => {
	const node = document.createElement('span');
	node.textContent = key;
	return node;
});

export default renderer_a;
