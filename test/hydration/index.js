import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as register from '../register';

import {
	loadConfig,
	loadSvelte,
	env,
	setupHtmlEqual,
	shouldUpdateExpected
} from '../helpers.js';

let svelte;

describe('hydration', () => {
	before(() => {
		svelte = loadSvelte();

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

			register.setCompileOptions({
				...config.compileOptions,
				hydratable: true,
			});
			register.setCompile(svelte.compile);
			register.setOutputFolderName('hydratable');

			const window = env();

			global.window = window;

			const SvelteComponent = require(`${cwd}/main.svelte`).default;

			const target = window.document.body;
			target.innerHTML = fs.readFileSync(`${cwd}/_before.html`, 'utf-8');

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

			if (config.test) {
				config.test(assert, target, snapshot, component, window);
			} else {
				component.$destroy();
				assert.equal(target.innerHTML, '');
			}
		});
	}

	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		runTest(dir, null);
	});
});
