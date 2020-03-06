import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

import {
	showOutput,
	loadConfig,
	loadSvelte,
	env,
	setupHtmlEqual,
	shouldUpdateExpected
} from '../helpers.js';

let compileOptions = null;

const sveltePath = process.cwd();

describe('hydration', () => {
	before(() => {
		const svelte = loadSvelte();

		require.extensions['.svelte'] = function(module, filename) {
			const options = Object.assign(
				{
					filename,
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
		const solo = config.solo || /\.solo/.test(dir);

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		(config.skip ? it.skip : solo ? it.only : it)(dir, () => {
			const cwd = path.resolve(`${__dirname}/samples/${dir}`);

			compileOptions = config.compileOptions || {};

			const window = env();

			try {
				global.window = window;

				let SvelteComponent;

				try {
					SvelteComponent = require(`${cwd}/main.svelte`).default;
				} catch (err) {
					throw err;
				}

				const target = window.document.body;
				const head = window.document.head;

				target.innerHTML = fs.readFileSync(`${cwd}/_before.html`, 'utf-8');

				let before_head;
				try {
					before_head = fs.readFileSync(`${cwd}/_before_head.html`, 'utf-8');
					head.innerHTML = before_head;
				} catch (err) {}

				const snapshot = config.snapshot ? config.snapshot(target) : {};

				const component = new SvelteComponent({
					target,
					hydrate: true,
					props: config.props
				});

				try {
					assert.htmlEqual(target.innerHTML, fs.readFileSync(`${cwd}/_after.html`, 'utf-8'));
				} catch (error) {
					if (shouldUpdateExpected()) {
						fs.writeFileSync(`${cwd}/_after.html`, target.innerHTML);
						console.log(`Updated ${cwd}/_after.html.`);
					} else {
						throw error;
					}
				}

				if (before_head) {
					try {
						assert.htmlEqual(head.innerHTML, fs.readFileSync(`${cwd}/_after_head.html`, 'utf-8'));
					} catch (error) {
						if (shouldUpdateExpected()) {
							fs.writeFileSync(`${cwd}/_after_head.html`, head.innerHTML);
							console.log(`Updated ${cwd}/_after_head.html.`);
						} else {
							throw error;
						}
					}
				}

				if (config.test) {
					config.test(assert, target, snapshot, component, window);
				} else {
					component.$destroy();
					assert.equal(target.innerHTML, '');
				}
			} catch (err) {
				showOutput(cwd, {
					hydratable: true
				});
				throw err;
			}

			if (config.show) showOutput(cwd, {
				hydratable: true
			});
		});
	}

	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		runTest(dir, null);
	});
});
