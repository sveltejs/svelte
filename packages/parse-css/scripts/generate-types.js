import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createBundle } from 'dts-buddy';

const dir = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(`${dir}/package.json`, 'utf-8'));

await createBundle({
	output: `${dir}/types/index.d.ts`,
	modules: {
		[pkg.name]: `${dir}/src/public.d.ts`
	}
});
