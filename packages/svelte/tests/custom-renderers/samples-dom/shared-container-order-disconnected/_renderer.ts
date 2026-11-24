import host, { create_test_renderer } from '../../renderer.js';
import { shared_connection } from '../../renderer-shared-order.js';

const guest = create_test_renderer({ cross: false });
export const scene = guest.createFragment();

guest.embed = shared_connection(scene, 'xab', (key) => {
	const node = host.createElement('crossing');
	host.setAttribute(node, 'data-key', key);
	return node;
});

export default guest;
