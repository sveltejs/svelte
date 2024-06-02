import { flushSync } from 'svelte';
import { test } from '../../test';

// Tests that default values apply every time and that they propagate back correctly for bindings
export default test({
	// set accessors to false so that $.prop() is also created
	accessors: false,
	html: `
	<p>props undefined:</p>
	<p>
		readonly:
		readonlyWithDefault: 1
		binding:
	</p>
	<button>set bindings to 5</button>
	<button>set bindings to undefined</button>

	<p>props defined:</p>
	<p>
		readonly: 0
		readonlyWithDefault: 0
		binding: 0
	</p>
	<button>set bindings to 5</button>
	<button>set bindings to undefined</button>

	<p>bindings undefined:</p>
	<p>
		readonly:
		readonlyWithDefault: 1
		binding:
	</p>
	<button>set bindings to 5</button>
	<button>set bindings to undefined</button>

	<p>bindings defined:</p>
	<p>
		readonly: 0
		readonlyWithDefault: 0
		binding: 0
	</p>
	<button>set bindings to 5</button>
	<button>set bindings to undefined</button>

	<p>
		Main:
		readonly_undefined:
		readonlyWithDefault_undefined:
		binding_undefined:
		readonly_defined: 0
		readonlyWithDefault_defined: 0
		binding_defined: 0
		bind_readonly_undefined:
		bind_binding_undefined:
		bind_readonly_defined: 0
		bind_binding_defined: 0
	</p>

	<button>set everything to 10</button>
	<button>set everything to undefined</button>
	`,

	test({ assert, target }) {
		const [
			btn_5_1,
			btn_undefined_1,
			btn_5_2,
			btn_undefined_2,
			btn_5_3,
			btn_undefined_3,
			btn_5_4,
			btn_undefined_4,
			btn_all_10,
			btn_all_undefined
		] = target.querySelectorAll('button');

		btn_undefined_1.click();
		btn_undefined_2.click();
		btn_undefined_3.click();
		btn_undefined_4.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>props undefined:</p>
			<p>
				readonly:
				readonlyWithDefault: 1
				binding:
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>props defined:</p>
			<p>
				readonly: 0
				readonlyWithDefault: 0
				binding:
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>bindings undefined:</p>
			<p>
				readonly:
				readonlyWithDefault: 1
				binding:
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>bindings defined:</p>
			<p>
				readonly: 0
				readonlyWithDefault: 0
				binding:
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>
				Main:
				readonly_undefined:
				readonlyWithDefault_undefined:
				binding_undefined:
				readonly_defined: 0
				readonlyWithDefault_defined: 0
				binding_defined: 0
				bind_readonly_undefined:
				bind_binding_undefined:
				bind_readonly_defined: 0
				bind_binding_defined:
			</p>

			<button>set everything to 10</button>
			<button>set everything to undefined</button>
		`
		);

		btn_5_1.click();
		btn_5_2.click();
		btn_5_3.click();
		btn_5_4.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>props undefined:</p>
			<p>
				readonly:
				readonlyWithDefault: 1
				binding: 5
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>props defined:</p>
			<p>
				readonly: 0
				readonlyWithDefault: 0
				binding: 5
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>bindings undefined:</p>
			<p>
				readonly:
				readonlyWithDefault: 1
				binding: 5
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>bindings defined:</p>
			<p>
				readonly: 0
				readonlyWithDefault: 0
				binding: 5
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>
				Main:
				readonly_undefined:
				readonlyWithDefault_undefined:
				binding_undefined:
				readonly_defined: 0
				readonlyWithDefault_defined: 0
				binding_defined: 0
				bind_readonly_undefined:
				bind_binding_undefined: 5
				bind_readonly_defined: 0
				bind_binding_defined: 5
			</p>

			<button>set everything to 10</button>
			<button>set everything to undefined</button>
		`
		);

		btn_all_10.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>props undefined:</p>
			<p>
				readonly: 10
				readonlyWithDefault: 10
				binding: 10
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>props defined:</p>
			<p>
				readonly: 10
				readonlyWithDefault: 10
				binding: 10
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>bindings undefined:</p>
			<p>
				readonly: 10
				readonlyWithDefault: 10
				binding: 10
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>bindings defined:</p>
			<p>
				readonly: 10
				readonlyWithDefault: 10
				binding: 10
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>
				Main:
				readonly_undefined: 10
				readonlyWithDefault_undefined: 10
				binding_undefined: 10
				readonly_defined: 10
				readonlyWithDefault_defined: 10
				binding_defined: 10
				bind_readonly_undefined: 10
				bind_binding_undefined: 10
				bind_readonly_defined: 10
				bind_binding_defined: 10
			</p>

			<button>set everything to 10</button>
			<button>set everything to undefined</button>
		`
		);

		btn_all_undefined.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>props undefined:</p>
			<p>
				readonly:
				readonlyWithDefault: 1
				binding:
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>props defined:</p>
			<p>
				readonly:
				readonlyWithDefault: 1
				binding:
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>bindings undefined:</p>
			<p>
				readonly:
				readonlyWithDefault: 1
				binding:
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>bindings defined:</p>
			<p>
				readonly:
				readonlyWithDefault: 1
				binding:
			</p>
			<button>set bindings to 5</button>
			<button>set bindings to undefined</button>

			<p>
				Main:
				readonly_undefined:
				readonlyWithDefault_undefined:
				binding_undefined:
				readonly_defined:
				readonlyWithDefault_defined:
				binding_defined:
				bind_readonly_undefined:
				bind_binding_undefined:
				bind_readonly_defined:
				bind_binding_defined:
			</p>

			<button>set everything to 10</button>
			<button>set everything to undefined</button>
		`
		);
	}
});
