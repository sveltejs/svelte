import { test } from '../../test';

export default test({
	compileOptions: { dev: true }, // tests `@validate_store` code generation

	html: `
		<p>42</p>
	`
});
