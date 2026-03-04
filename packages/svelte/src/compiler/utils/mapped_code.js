/** @import { ValidatedCompileOptions } from '#compiler' */
/** @import { Processed } from '../preprocess/public.js' */
/** @import { SourceMap } from 'magic-string' */
/** @import { Source } from '../preprocess/private.js' */
/** @import { DecodedSourceMap, SourceMapSegment, RawSourceMap } from '@jridgewell/remapping' */
import remapping from '@jridgewell/remapping';
import { push_array } from './push_array.js';

/**
 * @param {string} s
 */
function last_line_length(s) {
	return s.length - s.lastIndexOf('\n') - 1;
}
// mutate map in-place

/**
 * @param {DecodedSourceMap} map
 * @param {{ line: number; column: number; }} offset
 * @param {number} source_index
 */
export function sourcemap_add_offset(map, offset, source_index) {
	if (map.mappings.length == 0) return;
	for (let line = 0; line < map.mappings.length; line++) {
		const segment_list = map.mappings[line];
		for (let segment = 0; segment < segment_list.length; segment++) {
			const seg = segment_list[segment];
			// shift only segments that belong to component source file
			if (seg[1] === source_index) {
				// also ensures that seg.length >= 4
				// shift column if it points at the first line
				if (seg[2] === 0) {
					/** @type {any} */ (seg[3]) += offset.column;
				}
				// shift line
				/** @type {any} */ (seg[2]) += offset.line;
			}
		}
	}
}

/**
 * @template T
 * @param {T[]} this_table
 * @param {T[]} other_table
 * @returns {[T[], number[], boolean, boolean]}
 */
function merge_tables(this_table, other_table) {
	const new_table = this_table.slice();
	const idx_map = [];
	other_table = other_table || [];
	let val_changed = false;
	for (const [other_idx, other_val] of other_table.entries()) {
		const this_idx = this_table.indexOf(other_val);
		if (this_idx >= 0) {
			idx_map[other_idx] = this_idx;
		} else {
			const new_idx = new_table.length;
			new_table[new_idx] = other_val;
			idx_map[other_idx] = new_idx;
			val_changed = true;
		}
	}
	let idx_changed = val_changed;
	if (val_changed) {
		if (idx_map.find((val, idx) => val != idx) === undefined) {
			// idx_map is identity map [0, 1, 2, 3, 4, ....]
			idx_changed = false;
		}
	}
	return [new_table, idx_map, val_changed, idx_changed];
}
const regex_line_token = /([^\w\s]|\s+)/g;
/** */
export class MappedCode {
	/**
	 * @type {string}
	 */
	string = /** @type {any} */ (undefined);

	/**
	 * @type {DecodedSourceMap}
	 */
	map = /** @type {any} */ (undefined);

	/**
	 * @param {string} string
	 * @param {DecodedSourceMap | null} map
	 */
	constructor(string = '', map = null) {
		this.string = string;
		if (map) {
			this.map = map;
		} else {
			this.map = {
				version: 3,
				mappings: [],
				sources: [],
				names: []
			};
		}
	}
	/**
	 * concat in-place (mutable), return this (chainable)
	 * will also mutate the `other` object
	 * @param {MappedCode} other
	 * @returns {MappedCode}
	 */
	concat(other) {
		// noop: if one is empty, return the other
		if (other.string == '') return this;
		if (this.string == '') {
			this.string = other.string;
			this.map = other.map;
			return this;
		}
		// compute last line length before mutating
		const column_offset = last_line_length(this.string);
		this.string += other.string;
		const m1 = this.map;
		const m2 = other.map;
		if (m2.mappings.length == 0) return this;
		// combine sources and names
		const [sources, new_source_idx, sources_changed, sources_idx_changed] = merge_tables(
			m1.sources,
			m2.sources
		);
		const [names, new_name_idx, names_changed, names_idx_changed] = merge_tables(
			m1.names,
			m2.names
		);
		if (sources_changed) m1.sources = sources;
		if (names_changed) m1.names = names;
		// unswitched loops are faster
		if (sources_idx_changed && names_idx_changed) {
			for (let line = 0; line < m2.mappings.length; line++) {
				const segment_list = m2.mappings[line];
				for (let segment = 0; segment < segment_list.length; segment++) {
					const seg = segment_list[segment];
					// @ts-ignore
					if (seg[1] >= 0) seg[1] = new_source_idx[seg[1]];
					// @ts-ignore
					if (seg[4] >= 0) seg[4] = new_name_idx[seg[4]];
				}
			}
		} else if (sources_idx_changed) {
			for (let line = 0; line < m2.mappings.length; line++) {
				const segment_list = m2.mappings[line];
				for (let segment = 0; segment < segment_list.length; segment++) {
					const seg = segment_list[segment];
					// @ts-ignore
					if (seg[1] >= 0) seg[1] = new_source_idx[seg[1]];
				}
			}
		} else if (names_idx_changed) {
			for (let line = 0; line < m2.mappings.length; line++) {
				const segment_list = m2.mappings[line];
				for (let segment = 0; segment < segment_list.length; segment++) {
					const seg = segment_list[segment];
					// @ts-ignore
					if (seg[4] >= 0) seg[4] = new_name_idx[seg[4]];
				}
			}
		}
		// combine the mappings
		// combine
		// 1. last line of first map
		// 2. first line of second map
		// columns of 2 must be shifted
		if (m2.mappings.length > 0 && column_offset > 0) {
			const first_line = m2.mappings[0];
			for (let i = 0; i < first_line.length; i++) {
				first_line[i][0] += column_offset;
			}
		}
		// combine last line + first line
		push_array(
			m1.mappings[m1.mappings.length - 1],
			/** @type {SourceMapSegment[]} */ (m2.mappings.shift())
		);
		// append other lines
		push_array(m1.mappings, m2.mappings);
		return this;
	}

	/**
	 * @static
	 * @param {string} string
	 * @param {DecodedSourceMap} [map]
	 * @returns {MappedCode}
	 */
	static from_processed(string, map) {
		const line_count = string.split('\n').length;
		if (map) {
			// ensure that count of source map mappings lines
			// is equal to count of generated code lines
			// (some tools may produce less)
			const missing_lines = line_count - map.mappings.length;
			for (let i = 0; i < missing_lines; i++) {
				map.mappings.push([]);
			}
			return new MappedCode(string, map);
		}
		if (string == '') return new MappedCode();
		map = { version: 3, names: [], sources: [], mappings: [] };
		// add empty SourceMapSegment[] for every line
		for (let i = 0; i < line_count; i++) map.mappings.push([]);
		return new MappedCode(string, map);
	}

	/**
	 * @static
	 * @param {Source} opts
	 * @returns {MappedCode}
	 */
	static from_source({ source, file_basename, get_location }) {
		/**
		 * @type {{ line: number; column: number; }}
		 */
		let offset = get_location(0);
		if (!offset) offset = { line: 0, column: 0 };

		/**
		 * @type {DecodedSourceMap}
		 */
		const map = { version: 3, names: [], sources: [file_basename], mappings: [] };
		if (source == '') return new MappedCode(source, map);
		// we create a high resolution identity map here,
		// we know that it will eventually be merged with svelte's map,
		// at which stage the resolution will decrease.
		const line_list = source.split('\n');
		for (let line = 0; line < line_list.length; line++) {
			map.mappings.push([]);
			const token_list = line_list[line].split(regex_line_token);
			for (let token = 0, column = 0; token < token_list.length; token++) {
				if (token_list[token] == '') continue;
				map.mappings[line].push([column, 0, offset.line + line, column]);
				column += token_list[token].length;
			}
		}
		// shift columns in first line
		const segment_list = map.mappings[0];
		for (let segment = 0; segment < segment_list.length; segment++) {
			// @ts-ignore
			segment_list[segment][3] += offset.column;
		}
		return new MappedCode(source, map);
	}
}

// browser vs node.js
const b64enc =
	typeof window !== 'undefined' && typeof btoa === 'function'
		? /** @param {string} str */ (str) => btoa(unescape(encodeURIComponent(str)))
		: /** @param {string} str */ (str) => Buffer.from(str).toString('base64');
const b64dec =
	typeof window !== 'undefined' && typeof atob === 'function'
		? atob
		: /** @param {any} a */ (a) => Buffer.from(a, 'base64').toString();

/**
 * @param {string} filename Basename of the input file
 * @param {Array<DecodedSourceMap | RawSourceMap>} sourcemap_list
 */
export function combine_sourcemaps(filename, sourcemap_list) {
	if (sourcemap_list.length == 0) return null;
	let map_idx = 1;
	const map =
		sourcemap_list.slice(0, -1).find((m) => m.sources.length !== 1) === undefined
			? remapping(
					// use array interface
					// only the oldest sourcemap can have multiple sources
					sourcemap_list,
					() => null,
					true // skip optional field `sourcesContent`
				)
			: remapping(
					// use loader interface
					sourcemap_list[0], // last map
					(sourcefile) => {
						// TODO the equality check assumes that the preprocessor map has the input file as a relative path in sources,
						// e.g. when the input file is `src/foo/bar.svelte`, then sources is expected to contain just `bar.svelte`.
						// Therefore filename also needs to be the basename of the path. This feels brittle, investigate how we can
						// harden this (without breaking other tooling that assumes this behavior).
						if (sourcefile === filename && sourcemap_list[map_idx]) {
							return sourcemap_list[map_idx++]; // idx 1, 2, ...
							// bundle file = branch node
						} else {
							return null; // source file = leaf node
						}
					},
					true
				);
	if (!map.file) delete map.file; // skip optional field `file`
	// When source maps are combined and the leading map is empty, sources is not set.
	// Add the filename to the empty array in this case.
	// Further improvements to remapping may help address this as well https://github.com/ampproject/remapping/issues/116
	if (!map.sources.length) map.sources = [filename];
	return map;
}

/**
 * @param {string} filename
 * @param {SourceMap} svelte_map
 * @param {string | DecodedSourceMap | RawSourceMap} preprocessor_map_input
 * @returns {SourceMap}
 */
function apply_preprocessor_sourcemap(filename, svelte_map, preprocessor_map_input) {
	if (!svelte_map || !preprocessor_map_input) return svelte_map;
	const preprocessor_map =
		typeof preprocessor_map_input === 'string'
			? JSON.parse(preprocessor_map_input)
			: preprocessor_map_input;
	const result_map = combine_sourcemaps(filename, [svelte_map, preprocessor_map]);
	// Svelte expects a SourceMap which includes toUrl and toString. Instead of wrapping our output in a class,
	// we just tack on the extra properties.
	Object.defineProperties(result_map, {
		toString: {
			enumerable: false,
			value: function toString() {
				return JSON.stringify(this);
			}
		},
		toUrl: {
			enumerable: false,
			value: function toUrl() {
				return 'data:application/json;charset=utf-8;base64,' + b64enc(this.toString());
			}
		}
	});
	return /** @type {any} */ (result_map);
}
const regex_data_uri = /data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(\S*)/;
// parse attached sourcemap in processed.code

/**
 * @param {Processed} processed
 * @param {'script' | 'style'} tag_name
 * @returns {void}
 */
export function parse_attached_sourcemap(processed, tag_name) {
	const r_in = '[#@]\\s*sourceMappingURL\\s*=\\s*(\\S*)';
	const regex =
		tag_name == 'script'
			? new RegExp('(?://' + r_in + ')|(?:/\\*' + r_in + '\\s*\\*/)$')
			: new RegExp('/\\*' + r_in + '\\s*\\*/$');

	/**
	 * @param {any} message
	 */
	function log_warning(message) {
		// code_start: help to find preprocessor
		const code_start =
			processed.code.length < 100 ? processed.code : processed.code.slice(0, 100) + ' [...]';
		// eslint-disable-next-line no-console
		console.warn(`warning: ${message}. processed.code = ${JSON.stringify(code_start)}`);
	}
	processed.code = processed.code.replace(regex, (_, match1, match2) => {
		const map_url = tag_name == 'script' ? match1 || match2 : match1;
		const map_data = (map_url.match(regex_data_uri) || [])[1];
		if (map_data) {
			// sourceMappingURL is data URL
			if (processed.map) {
				log_warning(
					'Not implemented. ' +
						'Found sourcemap in both processed.code and processed.map. ' +
						'Please update your preprocessor to return only one sourcemap.'
				);
				// ignore attached sourcemap
				return '';
			}
			processed.map = b64dec(map_data); // use attached sourcemap
			return ''; // remove from processed.code
		}
		// sourceMappingURL is path or URL
		if (!processed.map) {
			log_warning(
				`Found sourcemap path ${JSON.stringify(
					map_url
				)} in processed.code, but no sourcemap data. ` +
					'Please update your preprocessor to return sourcemap data directly.'
			);
		}
		// ignore sourcemap path
		return ''; // remove from processed.code
	});
}

/**
 * @param {{ code: string, map: SourceMap}} result
 * @param {ValidatedCompileOptions} options
 * @param {string} source_name
 */
export function merge_with_preprocessor_map(result, options, source_name) {
	if (options.sourcemap) {
		const file_basename = get_basename(options.filename);
		// The preprocessor map is expected to contain `sources: [basename_of_filename]`, but our own
		// map may contain a different file name. Patch our map beforehand to align sources so merging
		// with the preprocessor map works correctly.
		result.map.sources = [file_basename];
		Object.assign(
			result.map,
			apply_preprocessor_sourcemap(
				file_basename,
				result.map,
				/** @type {any} */ (options.sourcemap)
			)
		);
		// After applying the preprocessor map, we need to do the inverse and make the sources
		// relative to the input file again in case the output code is in a different directory.
		if (file_basename !== source_name) {
			result.map.sources = result.map.sources.map(
				/** @param {string} source */ (source) => get_relative_path(source_name, source)
			);
		}
	}
}

/**
 * @param {string} from
 * @param {string} to
 */
function get_relative_path(from, to) {
	// Don't use node's utils here to ensure the compiler is usable in a browser environment
	const from_parts = from.split(/[/\\]/);
	const to_parts = to.split(/[/\\]/);
	from_parts.pop(); // get dirname
	while (from_parts[0] === to_parts[0]) {
		from_parts.shift();
		to_parts.shift();
	}
	if (from_parts.length) {
		let i = from_parts.length;
		while (i--) from_parts[i] = '..';
	}
	return from_parts.concat(to_parts).join('/');
}

/**
 * Like node's `basename`, but doesn't use it to ensure the compiler is usable in a browser environment
 * @param {string} filename
 */
export function get_basename(filename) {
	return /** @type {string} */ (filename.split(/[/\\]/).pop());
}

/**
 * @param {string} filename
 * @param {string | undefined} output_filename
 * @param {string} fallback
 */
export function get_source_name(filename, output_filename, fallback) {
	return output_filename ? get_relative_path(output_filename, filename) : get_basename(filename);
}
