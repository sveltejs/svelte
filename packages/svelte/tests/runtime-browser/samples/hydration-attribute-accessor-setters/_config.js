import { test } from '../../assert';
import { calls, wrap } from './accessors.js';

export default test({
	mode: ['hydrate'],

	before_test() {
		wrap('wrapped');
	},

	test({ assert, target }) {
		// setters that wrap the native ones still run, including ones replaced after the first
		// elements were hydrated, and so do own setters added while hydrating
		assert.deepEqual(calls, [
			'wrapped early disabled',
			'wrapped early hidden',
			'replaced late disabled',
			'wrapped late disabled',
			'replaced late hidden',
			'wrapped late hidden',
			'own true'
		]);

		for (const element of target.querySelectorAll('[data-wrapped]')) {
			assert.equal(element.getAttribute('data-wrapped'), 'true');
		}

		assert.equal(target.querySelectorAll('[data-wrapped]').length, 4);
		assert.equal(target.querySelectorAll('[data-replaced="true"]').length, 2);
	}
});
