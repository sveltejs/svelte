import { parse } from '../../../packages/svelte/src/compiler/phases/1-parse/index.js';
import { fastest_test } from '../../utils.js';

const elements_source = Array.from(
	{ length: 1000 },
	(_, i) =>
		`<!-- item ${i} --><section data-index="${i}" class="card card-${i}" title="plain text ${i}"><h2>Item ${i} has a reasonably long entity-free text value</h2><input disabled value="prefix {value} suffix"><textarea>plain {value} text</textarea></section>`
).join('\n');

const script_style_source = `<script>
	// line comment
	/* block comment */
	const value = 42;
</script>

<style>
${Array.from(
	{ length: 1000 },
	(_, i) => `.item-${i} { /* property ${i} */ color: red; margin-inline: ${i}px; }`
).join('\n')}
</style>`;

const typescript_source = `${Array.from(
	{ length: 1000 },
	(_, i) => `<div data-index="${i}">Item ${i}</div>`
).join('\n')}
{value as number}
<script lang="ts">
	let value: number = 42;
</script>${' \n'.repeat(1000)}`;

/**
 * @param {string} label
 * @param {string} source
 * @param {number} iterations
 */
function create_parser_benchmark(label, source, iterations) {
	return {
		label,
		fn: async () => {
			for (let i = 0; i < iterations; i++) {
				parse(source);
			}

			return await fastest_test(10, () => {
				for (let i = 0; i < iterations; i++) {
					parse(source);
				}
			});
		}
	};
}

export const parser_benchmarks = [
	create_parser_benchmark('parser_elements', elements_source, 5),
	create_parser_benchmark('parser_script_style', script_style_source, 50),
	create_parser_benchmark('parser_typescript', typescript_source, 25)
];
