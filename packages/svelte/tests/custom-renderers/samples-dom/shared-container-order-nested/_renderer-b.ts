import { create_test_renderer } from '../../renderer.js';
import { shared_connection } from '../../renderer-shared-order.js';
import renderer_a from './_renderer-a.js';

const renderer_b = create_test_renderer({ cross: false });
export const scene_b = renderer_b.createFragment();

renderer_b.embed = shared_connection(scene_b, 'xab', (key) => {
	const node = renderer_a.createElement('crossing');
	renderer_a.setAttribute(node, 'data-key', key);
	return node;
});

export default renderer_b;
