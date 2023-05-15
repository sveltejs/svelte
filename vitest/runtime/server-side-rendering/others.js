// duplicate client-side tests, as far as possible
runRuntimeSamples('runtime');
runRuntimeSamples('runtime-browser');

function runRuntimeSamples(suite) {
	fs.readdirSync(`test/${suite}/samples`).forEach((dir) => {
		if (dir[0] === '.') return;

		const config = loadConfig(`./${suite}/samples/${dir}/_config.js`);
		const solo = config.solo || /\.solo/.test(dir);

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		if (config.skip_if_ssr) return;

		(config.skip ? it.skip : solo ? it.only : it)(dir, () => {
			const cwd = path.resolve(`test/${suite}/samples`, dir);

			cleanRequireCache();

			delete global.window;

			const compileOptions = {
				sveltePath,
				...config.compileOptions,
				generate: 'ssr',
				format: 'cjs'
			};

			require('../../register')(compileOptions);

			glob('**/*.svelte', { cwd }).forEach((file) => {
				if (file[0] === '_') return;

				const dir = `${cwd}/_output/ssr`;
				const out = `${dir}/${file.replace(/\.svelte$/, '.js')}`;

				if (fs.existsSync(out)) {
					fs.unlinkSync(out);
				}

				mkdirp(dir);

				try {
					const { js } = compile(fs.readFileSync(`${cwd}/${file}`, 'utf-8'), {
						...compileOptions,
						filename: file
					});

					fs.writeFileSync(out, js.code);
				} catch (err) {
					// do nothing
				}
			});

			try {
				if (config.before_test) config.before_test();

				const Component = require(`../${suite}/samples/${dir}/main.svelte`).default;
				const { html } = Component.render(config.props, {
					store: config.store !== true && config.store
				});

				if (config.ssrHtml) {
					assert.htmlEqualWithOptions(html, config.ssrHtml, {
						preserveComments: compileOptions.preserveComments,
						withoutNormalizeHtml: config.withoutNormalizeHtml
					});
				} else if (config.html) {
					assert.htmlEqualWithOptions(html, config.html, {
						preserveComments: compileOptions.preserveComments,
						withoutNormalizeHtml: config.withoutNormalizeHtml
					});
				}

				if (config.test_ssr) {
					config.test_ssr({ assert });
				}

				if (config.after_test) config.after_test();

				if (config.show) {
					showOutput(cwd, compileOptions);
				}
			} catch (err) {
				err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), cwd)}/main.svelte`;

				if (config.error) {
					if (typeof config.error === 'function') {
						config.error(assert, err);
					} else {
						assert.equal(err.message, config.error);
					}
				} else {
					showOutput(cwd, compileOptions);
					throw err;
				}
			} finally {
				set_current_component(null);
			}
		});
	});
}
