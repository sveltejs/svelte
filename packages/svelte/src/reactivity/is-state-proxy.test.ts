import { assert, test } from 'vitest';
import { proxy } from '../internal/client/proxy.js';
import { isStateProxy as is_state_proxy_client } from './index-client.js';
import { isStateProxy as is_state_proxy_server } from './index-server.js';

test('isStateProxy detects state proxies on client', () => {
	const proxied_object = proxy({ a: 1 });
	const proxied_array = proxy([1, 2, 3]);

	assert.equal(is_state_proxy_client(proxied_object), true);
	assert.equal(is_state_proxy_client(proxied_array), true);
	assert.equal(is_state_proxy_client({ a: 1 }), false);
	assert.equal(is_state_proxy_client([1, 2, 3]), false);
	assert.equal(is_state_proxy_client('x'), false);
	assert.equal(is_state_proxy_client(null), false);
	assert.equal(is_state_proxy_client(NaN), false);
});

test('isStateProxy always returns false on server export', () => {
	assert.equal(is_state_proxy_server(proxy({ a: 1 })), false);
	assert.equal(is_state_proxy_server({ a: 1 }), false);
	assert.equal(is_state_proxy_server(null), false);
});
