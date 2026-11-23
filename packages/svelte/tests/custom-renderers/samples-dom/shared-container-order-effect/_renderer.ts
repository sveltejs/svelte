import { create_test_renderer } from '../../renderer.js';
import { shared_connection } from '../../renderer-shared-order.js';

const host = create_test_renderer({ cross: false });
export const guest = document.createElement('output');

host.host = shared_connection(guest, 'ab', (key) => {
	const node = host.createElement('crossing');
	host.setAttribute(node, 'data-key', key);
	return node;
});

export default host;
