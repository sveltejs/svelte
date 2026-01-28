// @vitest-environment jsdom

import * as fs from 'node:fs';
import { assert } from 'vitest';
import { compile_directory, try_read_file } from '../helpers.js';
import { assert_html_equal } from '../html_equal.js';
import { flushSync, mount, unmount } from 'svelte';
import { suite, type BaseTest } from '../suite.js';
import type { CompileOptions, Warning } from '#compiler';

function normalize_warning(warning: Warning) {
	delete warning.filename;
	delete warning.position;
	delete warning.frame;

	// Remove the "https://svelte.dev/e/..." link at the end
	const lines = warning.message.split('\n');
	if (lines.at(-1)?.startsWith('https://svelte.dev/e/')) {
		lines.pop();
	}
	warning.message = lines.join('\n');

	return warning;
}

function load_warnings(path: string) {
	if (!fs.existsSync(path)) {
		return [];
	}
	return JSON.parse(fs.readFileSync(path, 'utf-8')).map(normalize_warning);
}

interface CssTest extends BaseTest {
	compileOptions?: Partial<CompileOptions>;
	warnings?: Warning[];
	props?: Record<string, any>;
	hasGlobal?: boolean;
}

/**
 * Remove the "https://svelte.dev/e/..." link
 */
function strip_link(message: string) {
	return message.slice(0, message.lastIndexOf('\n'));
}

const { test, run } = suite<CssTest>(async (config, cwd) => {
	await compile_directory(cwd, 'client', { cssHash: () => 'svelte-xyz', ...config.compileOptions });
	await compile_directory(cwd, 'server', { cssHash: () => 'svelte-xyz', ...config.compileOptions });

	const expected = {
		html: try_read_file(`${cwd}/expected.html`),
		css: try_read_file(`${cwd}/expected.css`)
	};

	// we do this here, rather than in the expected.html !== null
	// block, to verify that valid code was generated
	const ClientComponent = (await import(`${cwd}/_output/client/input.svelte.js`)).default;
	const ServerComponent = (await import(`${cwd}/_output/server/input.svelte.js`)).default;

	// verify that the right elements have scoping selectors (do this first to ensure all actual files are written to disk)
	if (expected.html !== null) {
		const target = window.document.createElement('main');

		const component = mount(ClientComponent, { props: config.props ?? {}, target });
		flushSync();

		const html = target.innerHTML;

		fs.writeFileSync(`${cwd}/_output/rendered.html`, html);

		assert_html_equal(html, expected.html);

		unmount(component);
		window.document.head.innerHTML = ''; // remove added styles

		// TODO enable SSR tests
		// const actual_ssr = ServerComponent.render(config.props).html;
		// assert_html_equal(actual_ssr, expected.html);
	}

	if (config.hasGlobal !== undefined) {
		const metadata = JSON.parse(
			fs.readFileSync(`${cwd}/_output/client/input.svelte.css.json`, 'utf-8')
		);

		assert.equal(metadata.hasGlobal, config.hasGlobal);
	}

	const dom_css = fs.readFileSync(`${cwd}/_output/client/input.svelte.css`, 'utf-8').trim();
	const ssr_css = fs.readFileSync(`${cwd}/_output/server/input.svelte.css`, 'utf-8').trim();

	assert.equal(dom_css, ssr_css);

	const dom_warnings = load_warnings(`${cwd}/_output/client/input.svelte.warnings.json`);
	const ssr_warnings = load_warnings(`${cwd}/_output/server/input.svelte.warnings.json`);
	const expected_warnings = (config.warnings || []).map(normalize_warning);
	assert.deepEqual(dom_warnings, ssr_warnings);
	assert.deepEqual(dom_warnings.map(normalize_warning), expected_warnings);

	assert.equal(dom_css.trim().replace(/\r\n/g, '\n'), (expected.css ?? '').trim());
});

export { test };

await run(__dirname);
