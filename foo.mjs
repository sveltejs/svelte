import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
/**
 * 
 */
for (const sample of readdirSync('vitest/compiler-output/vars/samples')){
    const resolved = join('vitest/compiler-output/vars/samples', sample, '_config.mjs');

    if (existsSync(resolved)) {

        let content = readFileSync(resolved, 'utf-8');

        content = content.replace(/^(\s*)test\(assert, vars\)/gm, 
`
$1/**
$1 * @param {import("vitest").assert} assert
$1 */
$&`        )

        writeFileSync(resolved, content);
    }
}