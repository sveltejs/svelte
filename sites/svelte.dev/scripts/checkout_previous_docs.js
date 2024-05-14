import { execFile } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const force = process.env.FORCE_UPDATE === 'true';

const docs_dir = fileURLToPath(new URL('./previous-docs', import.meta.url));
const temp_dir = join(docs_dir, '(temp)');
const all_tags = (await run_process(['git', 'tag', '-l']))[0].split('\n');

console.log('Checking out previous versions of docs with git...');

try {
	for (const version_dir of readdirSync(docs_dir, { withFileTypes: true })) {
		if (!version_dir.isDirectory() || version_dir.name === '(temp)') continue;
		const version_path = join(docs_dir, version_dir.name);
		const {
			tags: { regex: tags_regex_raw, filter: tags_filter },
			path: repo_path,
			format
		} = /** @type {import('src/lib/docs/types').Config} */ JSON.parse(
			readFileSync(join(version_path, 'config.json'), 'utf-8')
		);

		// Filter list of tags
		const tags_regex = new RegExp(tags_regex_raw);
		/** @type {[string, string][]} pair of git tag ref and version */
		let tags = all_tags
			.map((tag) => {
				const match = tags_regex.exec(tag);
				if (match) return [match[0], match[1]];
				else return undefined;
			})
			.filter((t) => !!t);

		// Filter & title tags
		switch (tags_filter) {
			case 'minor': {
				// Only keep the latest patch version of every minor version
				// for each major/minor pair, keep the full tag name and latest patch version number
				/** @type {Map<string, [string, number]>} */
				const map = new Map();
				for (const [tag, version] of tags) {
					const match = version.match(/(\d+\.\d+)\.(\d+)/);
					if (match == null) {
						console.warn(
							`Discarding tag ${tag} as its version ${version} does not match SemVer for 'minor' tag filter`
						);
						continue;
					}
					const [, major_minor, patch] = match;
					if ((map.get(major_minor)?.[1] ?? -1) < +patch) map.set(major_minor, [tag, +patch]);
				}
				tags = [...map.entries()].map(([major_minor, [tag]]) => [tag, major_minor]);
				break;
			}
			case undefined:
				break;
			default:
				throw new Error(
					`Unknown 'tags.filter' value '${tags_filter}' in ${join(version_path, 'config.json')}`
				);
		}

		// Sort tags by title, descending
		tags.sort(([, title1], [, title2]) => {
			const t1 = title1.split('.'),
				t2 = title2.split('.');
			for (let i = 0; i < Math.min(t1.length, t2.length); ++i) {
				let n1 = Number(t1[i]),
					n2 = Number(t2[i]);
				if (isFinite(n1) && isFinite(n2) && n1 !== n2) return n1 - n2;
				const result = t1[i].localeCompare(t2[i]);
				if (result) return -result;
			}
			return t1.length - t2.length;
		});

		// Save docs
		let skipped = 0;
		let i = 0;
		for (const [ref, title] of tags) {
			let dest_path = join(version_path, `${String(i++).padStart(3, '0')}_${title}`);
			if (existsSync(dest_path)) {
				if (force) rmRf(dest_path);
				else {
					++skipped;
					continue;
				}
			}
			if (format === 'flat') {
				mkdirSync(dest_path);
				dest_path = join(dest_path, '01-documentation');
			}
			rmRf(temp_dir);
			mkdirSync(temp_dir);
			await run_process(['git', `--work-tree=${temp_dir}`, 'checkout', ref, '--', repo_path]);
			await renameSync(join(temp_dir, repo_path), dest_path);
			if (format === 'flat') {
				writeFileSync(
					join(dest_path, 'meta.json'),
					JSON.stringify({ title: 'Documentation' }, undefined, 2)
				);
			}
		}

		if (skipped) {
			console.log(`Skipped ${skipped} tags already checked out for version ${version_dir.name}`);
		}
	}
} finally {
	rmRf(temp_dir);
}

/**
 * @param {string[]} args Executable and its arguments
 * @returns {Promise<[string, string]>} Process result [stdout, stderr]
 */
function run_process(args) {
	return new Promise((resolve, reject) => {
		execFile(args[0], args.slice(1), (error, stdout, stderr) => {
			if (error) reject(error);
			resolve([stdout, stderr]);
		});
	});
}

function rmRf(path) {
	rmSync(path, { force: true, recursive: true });
}
