import fs from 'node:fs';
import { it } from 'vitest';

export interface BaseTest {
	skip?: boolean;
	solo?: boolean;
}

/**
 * To filter tests, run one of these:
 *
 * FILTER=my-test pnpm test    (runs only the 'my-test' test)
 * FILTER=/feature/ pnpm test  (runs all tests matching /feature/)
 */
const filter = process.env.FILTER
	? new RegExp(
			process.env.FILTER.startsWith('/')
				? process.env.FILTER.slice(1, -1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
				: `^${process.env.FILTER.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`
		)
	: /./;

export function suite<Test extends BaseTest>(fn: (config: Test, test_dir: string) => void) {
	return {
		test: (config: Test) => config,
		run: async (cwd: string, samples_dir = 'samples') => {
			await for_each_dir<Test>(cwd, samples_dir, (config, dir) => {
				let it_fn = config.skip ? it.skip : config.solo ? it.only : it;

				it_fn(dir, () => fn(config, `${cwd}/${samples_dir}/${dir}`));
			});
		}
	};
}

export function suite_with_variants<Test extends BaseTest, Variants extends string, Common>(
	variants: Variants[],
	should_skip_variant: (variant: Variants, config: Test) => boolean | 'no-test',
	common_setup: (config: Test, test_dir: string) => Promise<Common> | Common,
	fn: (config: Test, test_dir: string, variant: Variants, common: Common) => void
) {
	return {
		test: (config: Test) => config,
		run: async (cwd: string, samples_dir = 'samples') => {
			await for_each_dir<Test>(cwd, samples_dir, (config, dir) => {
				let called_common = false;
				let common: any = undefined;
				for (const variant of variants) {
					if (should_skip_variant(variant, config) === 'no-test') {
						continue;
					}
					// TODO unify test interfaces
					const skip = config.skip || should_skip_variant(variant, config);
					const solo = config.solo;
					let it_fn = skip ? it.skip : solo ? it.only : it;

					it_fn(`${dir} (${variant})`, async () => {
						if (!called_common) {
							called_common = true;
							common = await common_setup(config, `${cwd}/${samples_dir}/${dir}`);
						}
						return fn(config, `${cwd}/${samples_dir}/${dir}`, variant, common);
					});
				}
			});
		}
	};
}

// If a directory only contains these children, it's a sign that it's leftover
// from a different branch, and we can skip the test
const ignored = ['_output', '_actual.json'];

async function for_each_dir<Test extends BaseTest>(
	cwd: string,
	samples_dir = 'samples',
	fn: (config: Test, test_dir: string) => void
) {
	cwd = cwd.replace(/\\/g, '/');
	let created_test = false;

	for (const dir of fs.readdirSync(`${cwd}/${samples_dir}`)) {
		if (dir[0] === '.' || !filter.test(dir)) continue;

		if (fs.readdirSync(`${cwd}/${samples_dir}/${dir}`).every((file) => ignored.includes(file))) {
			continue;
		}

		const file = `${cwd}/${samples_dir}/${dir}/_config.js`;

		created_test = true;
		const config = (fs.existsSync(file) ? (await import(file)).default : {}) as Test;

		fn(config, dir);
	}

	if (!created_test) {
		// prevent vitest from polluting the console with a "no tests found" message
		it.skip(`[SKIP] ${cwd}`, () => {});
	}
}

export function assert_ok(value: any): asserts value {
	if (!value) {
		throw new Error(`Expected truthy value, got ${value}`);
	}
}
