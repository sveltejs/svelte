import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

import {
	showOutput,
	loadConfig,
	loadSvelte,
	env,
	setupHtmlEqual
} from '../helpers.js';

let compileOptions = null;

function getName(filename) {
	const base = path.basename(filename).replace('.html', '');
	return base[0].toUpperCase() + base.slice(1);
}

const sveltePath = process.cwd();

describe('hydration', () => {
	before(() => {
		const svelte = loadSvelte();

		require.extensions['.html'] = function(module, filename) {
			const options = Object.assign(
				{
					filename,
					name: getName(filename),
					hydratable: true,
					format: 'cjs',
					sveltePath
				},
				compileOptions
			);

			const { js } = svelte.compile(fs.readFileSync(filename, 'utf-8'), options);

			return module._compile(js.code, filename);
		};

		return setupHtmlEqual();
	});

	function runTest(dir) {
		if (dir[0] === '.') return;

		const config = loadConfig(`./hydration/samples/${dir}/_config.js`);

		if (config.solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		(config.skip ? it.skip : config.solo ? it.only : it)(dir, () => {
			const cwd = path.resolve(`test/hydration/samples/${dir}`);

			compileOptions = config.compileOptions || {};
			compileOptions.shared = path.resolve('internal.js');
			compileOptions.dev = config.dev;
			compileOptions.hydrate = true;

			const window = env();

			try {
				global.window = window;

				let SvelteComponent;

				try {
					SvelteComponent = require(`${cwd}/main.html`).default;
				} catch (err) {
					throw err;
				}

				const target = window.document.body;
				target.innerHTML = fs.readFileSync(`${cwd}/_before.html`, 'utf-8');

				const snapshot = config.snapshot ? config.snapshot(target) : {};

				const component = new SvelteComponent({
					target,
					hydrate: true,
					props: config.props
				});

				assert.htmlEqual(target.innerHTML, fs.readFileSync(`${cwd}/_after.html`, 'utf-8'));

				if (config.test) {
					config.test(assert, target, snapshot, component, window);
				} else {
					component.destroy();
					assert.equal(target.innerHTML, '');
				}
			} catch (err) {
				showOutput(cwd, {
					shared: 'svelte/internal.js',
					hydratable: true
				});
				throw err;
			}

			if (config.show) showOutput(cwd, {
				shared: 'svelte/internal.js',
				hydratable: true
			});
		});
	}

	fs.readdirSync('test/hydration/samples').forEach(dir => {
		runTest(dir, null);
	});
});
