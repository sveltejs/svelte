import { decode as decode_mappings } from '@jridgewell/sourcemap-codec';

/**
 * Import decoded sourcemap from mozilla/source-map/SourceMapGenerator
 * Forked from source-map/lib/source-map-generator.js
 * from methods _serializeMappings and toJSON.
 * We cannot use source-map.d.ts types, because we access hidden properties.
 * @param {any} generator
 */
function decoded_sourcemap_from_generator(generator) {
	let previous_generated_line = 1;
	/** @type {number[][][]} */
	const converted_mappings = [[]];
	let result_line = converted_mappings[0];
	let result_segment;
	let mapping;
	const source_idx = generator._sources
		.toArray()
		// @ts-ignore
		.reduce((acc, val, idx) => ((acc[val] = idx), acc), {});
	const name_idx = generator._names
		.toArray()
		// @ts-ignore
		.reduce((acc, val, idx) => ((acc[val] = idx), acc), {});
	const mappings = generator._mappings.toArray();
	for (let i = 0, len = mappings.length; i < len; i++) {
		mapping = mappings[i];
		if (mapping.generatedLine > previous_generated_line) {
			while (mapping.generatedLine > previous_generated_line) {
				converted_mappings.push([]);
				previous_generated_line++;
			}
			result_line = converted_mappings[mapping.generatedLine - 1]; // line is one-based
		} else if (i > 0) {
			const previous_mapping = mappings[i - 1];
			if (
				// sorted by selectivity
				mapping.generatedColumn === previous_mapping.generatedColumn &&
				mapping.originalColumn === previous_mapping.originalColumn &&
				mapping.name === previous_mapping.name &&
				mapping.generatedLine === previous_mapping.generatedLine &&
				mapping.originalLine === previous_mapping.originalLine &&
				mapping.source === previous_mapping.source
			) {
				continue;
			}
		}
		result_line.push([mapping.generatedColumn]);
		result_segment = result_line[result_line.length - 1];
		if (mapping.source != null) {
			result_segment.push(
				...[source_idx[mapping.source], mapping.originalLine - 1, mapping.originalColumn]
			);
			if (mapping.name != null) {
				result_segment.push(name_idx[mapping.name]);
			}
		}
	}

	/**
	 * @type {{
	 *  version: number;
	 * sources: string[];
	 * names: string[];
	 * mappings: number[][][];
	 * file?: string;
	 * }}
	 */
	const map = {
		version: generator._version,
		sources: generator._sources.toArray(),
		names: generator._names.toArray(),
		mappings: converted_mappings
	};
	if (generator._file != null) {
		map.file = generator._file;
	}
	// not needed: map.sourcesContent and map.sourceRoot
	return map;
}

/**
 * @param {import('./public.js').Processed} processed
 */
export function decode_map(processed) {
	let decoded_map = typeof processed.map === 'string' ? JSON.parse(processed.map) : processed.map;
	if (typeof decoded_map.mappings === 'string') {
		decoded_map.mappings = decode_mappings(decoded_map.mappings);
	}
	if (decoded_map._mappings && decoded_map.constructor.name === 'SourceMapGenerator') {
		// import decoded sourcemap from mozilla/source-map/SourceMapGenerator
		decoded_map = decoded_sourcemap_from_generator(decoded_map);
	}
	return decoded_map;
}
