import { test } from '../../assert';
import { measurements } from './measurements.js';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true } },
	async test({ assert, target, waitUntil }) {
		await waitUntil(() => measurements.length === 2);
		assert.htmlEqual(target.innerHTML, '<div style="width: 100px; height: 50px">loaded</div>');
		assert.deepEqual(measurements, [
			['mount', true, 100, 50],
			['effect', true, 100, 50]
		]);
	}
});
