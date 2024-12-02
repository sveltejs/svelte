// @vitest-environment jsdom
// Yes it's an SSR test, but we need the env to compare html
// This is in its own file because if we had the jsdom environment for the other playwright browser tests,
// esbuild would choke on it

import * as fs from 'node:fs';
import * as path from 'node:path';
import { setImmediate } from 'node:timers/promises';
import { render } from 'svelte/server';
import { compile_directory } from '../helpers';
import { assert_html_equal_with_options } from '../html_equal';
import { suite } from '../suite';
import { describe } from 'vitest';

export async function run_ssr_test(
	config: ReturnType<typeof import('./assert').test>,
	test_dir: string
) {
	try {
		await compile_directory(test_dir, 'server', config.compileOptions);

		const Component = (await import(`${test_dir}/_output/server/main.svelte.js`)).default;
		const { body } = render(Component, { props: config.props || {} });

		fs.writeFileSync(`${test_dir}/_output/rendered.html`, body);

		if (config.ssrHtml) {
			assert_html_equal_with_options(body, config.ssrHtml, {
				preserveComments: config.compileOptions?.preserveComments
			});
		} else if (config.html) {
			assert_html_equal_with_options(body, config.html, {
				preserveComments: config.compileOptions?.preserveComments
			});
		}
	} catch (err: any) {
		err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), test_dir)}/main.svelte`;
		throw err;
	}

	// wait for vitest to report progress
	await setImmediate();
}

const { run } = suite<ReturnType<typeof import('./assert').test>>(async (config, test_dir) => {
	if (config.mode && !config.mode.includes('server')) return;
	if (config.skip_mode?.includes('server')) return;
	await run_ssr_test(config, test_dir);
});

describe('runtime-browser (ssr)', async () => {
	await run(__dirname);
});
