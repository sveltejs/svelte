// @vitest-environment jsdom

import * as fs from 'node:fs';
import { assert } from 'vitest';
import { compile_directory, try_read_file } from '../helpers.js';
import { assert_html_equal } from '../html_equal.js';
import { createRoot } from 'svelte';
import { suite, type BaseTest } from '../suite.js';
import type { CompileOptions, Warning } from '#compiler';

// function normalize_warning(warning) {
// 	warning.frame = warning.frame.replace(/^\n/, '').replace(/^\t+/gm, '').replace(/\s+$/gm, '');
// 	delete warning.filename;
// 	delete warning.toString;
// 	return warning;
// }

interface CssTest extends BaseTest {
	compileOptions?: Partial<CompileOptions>;
	warnings?: Warning[];
	props?: Record<string, any>;
}

const { test, run } = suite<CssTest>(async (config, cwd) => {
	// TODO
	// const expected_warnings = (config.warnings || []).map(normalize_warning);

	await compile_directory(cwd, 'client', { cssHash: () => 'svelte-xyz', ...config.compileOptions });
	await compile_directory(cwd, 'server', { cssHash: () => 'svelte-xyz', ...config.compileOptions });

	const dom_css = fs.readFileSync(`${cwd}/_output/client/input.svelte.css`, 'utf-8').trim();
	const ssr_css = fs.readFileSync(`${cwd}/_output/server/input.svelte.css`, 'utf-8').trim();

	assert.equal(dom_css, ssr_css);

	// TODO reenable
	// const dom_warnings = dom.warnings.map(normalize_warning);
	// const ssr_warnings = ssr.warnings.map(normalize_warning);
	// assert.deepEqual(dom_warnings, ssr_warnings);
	// assert.deepEqual(dom_warnings.map(normalize_warning), expected_warnings);

	const expected = {
		html: try_read_file(`${cwd}/expected.html`),
		css: try_read_file(`${cwd}/expected.css`)
	};

	assert.equal(dom_css.trim().replace(/\r\n/g, '\n'), (expected.css ?? '').trim());

	// we do this here, rather than in the expected.html !== null
	// block, to verify that valid code was generated
	const ClientComponent = (await import(`${cwd}/_output/client/input.svelte.js`)).default;
	const ServerComponent = (await import(`${cwd}/_output/server/input.svelte.js`)).default;

	// verify that the right elements have scoping selectors
	if (expected.html !== null) {
		const target = window.document.createElement('main');

		const { $destroy } = createRoot(ClientComponent, { props: config.props ?? {}, target });

		const html = target.innerHTML;

		fs.writeFileSync(`${cwd}/_output/rendered.html`, html);

		assert_html_equal(html, expected.html);

		$destroy();
		window.document.head.innerHTML = ''; // remove added styles

		// TODO enable SSR tests
		// const actual_ssr = ServerComponent.render(config.props).html;
		// assert_html_equal(actual_ssr, expected.html);
	}
});

export { test };

await run(__dirname);
