import { assert, test } from 'vitest';
import { BOUNDARY_EFFECT, DESTROYED, REACTION_RAN } from './constants';
import { invoke_error_boundary } from './error-handling';
import type { Effect } from './types';

test('ignores errors from a destroyed entry effect', () => {
	const error = new Error('original');
	let handled = null;
	const boundary = {
		f: BOUNDARY_EFFECT | REACTION_RAN,
		b: { error: (error: unknown) => (handled = error) },
		parent: null
	} as unknown as Effect;
	const effect = { f: DESTROYED, parent: boundary } as Effect;

	invoke_error_boundary(error, effect);

	assert.equal(handled, null);
});

test('skips destroyed boundary ancestors without masking the error', () => {
	const error = new Error('original');
	let handled = null;
	const live_boundary = {
		f: BOUNDARY_EFFECT | REACTION_RAN,
		b: { error: (error: unknown) => (handled = error) },
		parent: null
	} as unknown as Effect;
	const destroyed_boundary = {
		f: BOUNDARY_EFFECT | DESTROYED | REACTION_RAN,
		b: null,
		parent: live_boundary
	} as unknown as Effect;
	const effect = { f: 0, parent: destroyed_boundary } as Effect;

	invoke_error_boundary(error, effect);

	assert.equal(handled, error);
});
