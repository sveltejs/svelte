import { test } from '../../test';

export default test({
	compileOptions: { dev: true }, // tests `@validate_store` code generation

	html: `<button>clicks:\n0</button>`
});
