// @vitest-environment vitest-xhtml-environment.ts

import { readFileSync } from 'fs';
import { runtime_suite, ok } from '../runtime-legacy/shared';

const { test, run } = runtime_suite(true);

function getSsrHtml(folder: string) {
	return readFileSync(`${folder}/_output/rendered.html`, 'utf-8');
}

export { test, ok, getSsrHtml };

await run(__dirname);
