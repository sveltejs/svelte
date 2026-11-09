import { test } from '../../test';

// a deterministic `NaN` key is idempotent (`NaN !== NaN`, but `Object.is(NaN, NaN)`),
// so the dev-mode key-idempotency check must not throw `each_key_volatile`
export default test({
	compileOptions: {
		dev: true
	},

	mode: ['client'],

	html: `<p>NaN</p>`
});
