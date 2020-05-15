import * as assert from 'assert';
type TestSetup = {
	test: ({ assert: module.assert, component, mod, target, window, raf, compileOptions }) => void | Promise<void>;
};