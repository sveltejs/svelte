import fs from 'node:fs';
import { inject, it } from 'vitest';

declare module 'vitest' {
	export interface ProvidedContext {
		/** Set for suites that are split up into several shards, see `vitest.config.js` */
		shard?: {
			index: number;
			count: number;
			/** Only run samples whose name starts with this prefix */
			include?: string;
			/** Don't run samples whose name starts with one of these prefixes (they have their own shard) */
			exclude?: string[];
		};
	}
}

export interface BaseTest {
	skip?: boolean;
	solo?: boolean;
	timeout?: number;
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

// this defaults to 10, which is too low for some of our tests
Error.stackTraceLimit = 100;

export function suite<Test extends BaseTest>(fn: (config: Test, test_dir: string) => void) {
	return {
		test: (config: Test) => config,
		run: async (cwd: string, samples_dir = 'samples') => {
			await for_each_dir<Test>(cwd, samples_dir, (config, dir) => {
				let it_fn = config.skip ? it.skip : config.solo ? it.only : it;

				it_fn(dir, { timeout: config.timeout }, () => fn(config, `${cwd}/${samples_dir}/${dir}`));
			});
		}
	};
}

export function suite_with_variants<Test extends BaseTest, Variants extends string, Common>(
	variants: Variants[],
	should_skip_variant: (variant: Variants, config: Test, test_name: string) => boolean | 'no-test',
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
					if (should_skip_variant(variant, config, dir) === 'no-test') {
						continue;
					}
					// TODO unify test interfaces
					const skip = config.skip || should_skip_variant(variant, config, dir);
					const solo = config.solo;
					let it_fn = skip ? it.skip : solo ? it.only : it;

					it_fn(`${dir} (${variant})`, { timeout: config.timeout }, async () => {
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

	const shard = inject('shard');
	const dirs = fs.readdirSync(`${cwd}/${samples_dir}`).filter((dir) => {
		if (dir[0] === '.') return false;
		if (shard?.include !== undefined) return dir.startsWith(shard.include);
		return !shard?.exclude?.some((prefix) => dir.startsWith(prefix));
	});

	for (let i = 0; i < dirs.length; i += 1) {
		const dir = dirs[i];

		// distribute samples in chunks
		if (shard && Math.floor((i * shard.count) / dirs.length) !== shard.index) continue;
		if (!filter.test(dir)) continue;

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
