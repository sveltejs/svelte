import { DecodedSourceMap, RawSourceMap, SourceMapLoader } from '@ampproject/remapping/dist/types/types';
import remapping from '@ampproject/remapping';
import { SourceMap } from 'magic-string';

type SourceLocation = {
	line: number;
	column: number;
};

function last_line_length(s: string) {
	return s.length - s.lastIndexOf('\n') - 1;
}

// mutate map in-place
export function sourcemap_add_offset(
	map: DecodedSourceMap, offset: SourceLocation, source_index: number
) {
	if (map.mappings.length == 0) return;
	for (let line = 0; line < map.mappings.length; line++) {
		const segment_list = map.mappings[line];
		for (let segment = 0; segment < segment_list.length; segment++) {
			const seg = segment_list[segment];
			// shift only segments that belong to component source file
			if (seg[1] === source_index) { // also ensures that seg.length >= 4
				// shift column if it points at the first line
				if (seg[2] === 0) {
					seg[3] += offset.column;
				}
				// shift line
				seg[2] += offset.line;
			}
		}
	}
}

function merge_tables<T>(this_table: T[], other_table: T[]): [T[], number[], boolean, boolean] {
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

function pushArray<T>(_this: T[], other: T[]) {
	// We use push to mutate in place for memory and perf reasons
	// We use the for loop instead of _this.push(...other) to avoid the JS engine's function argument limit (65,535 in JavascriptCore)
	for (let i = 0; i < other.length; i++) {
		_this.push(other[i]);
	}
}

export class StringWithSourcemap {
	string: string;
	map: DecodedSourceMap;

	constructor(string = '', map: DecodedSourceMap = null) {
		this.string = string;
		if (map) {
			this.map = map as DecodedSourceMap;
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
	 */
	concat(other: StringWithSourcemap): StringWithSourcemap {
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
		const [sources, new_source_idx, sources_changed, sources_idx_changed] = merge_tables(m1.sources, m2.sources);
		const [names, new_name_idx, names_changed, names_idx_changed] = merge_tables(m1.names, m2.names);

		if (sources_changed) m1.sources = sources;
		if (names_changed) m1.names = names;

		// unswitched loops are faster
		if (sources_idx_changed && names_idx_changed) {
			for (let line = 0; line < m2.mappings.length; line++) {
				const segment_list = m2.mappings[line];
				for (let segment = 0; segment < segment_list.length; segment++) {
					const seg = segment_list[segment];
					if (seg[1] >= 0) seg[1] = new_source_idx[seg[1]];
					if (seg[4] >= 0) seg[4] = new_name_idx[seg[4]];
				}
			}
		} else if (sources_idx_changed) {
			for (let line = 0; line < m2.mappings.length; line++) {
				const segment_list = m2.mappings[line];
				for (let segment = 0; segment < segment_list.length; segment++) {
					const seg = segment_list[segment];
					if (seg[1] >= 0) seg[1] = new_source_idx[seg[1]];
				}
			}
		} else if (names_idx_changed) {
			for (let line = 0; line < m2.mappings.length; line++) {
				const segment_list = m2.mappings[line];
				for (let segment = 0; segment < segment_list.length; segment++) {
					const seg = segment_list[segment];
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
		pushArray(m1.mappings[m1.mappings.length - 1], m2.mappings.shift());

		// append other lines
		pushArray(m1.mappings, m2.mappings);

		return this;
	}

	static from_processed(string: string, map?: DecodedSourceMap): StringWithSourcemap {
		const line_count = string.split('\n').length;

		if (map) {
			// ensure that count of source map mappings lines 
			// is equal to count of generated code lines
			// (some tools may produce less)
			const missing_lines = line_count - map.mappings.length;
			for (let i = 0; i < missing_lines; i++) {
				map.mappings.push([]);
			}
			return new StringWithSourcemap(string, map);
		}

		if (string == '') return new StringWithSourcemap();
		map = { version: 3, names: [], sources: [], mappings: [] };

		// add empty SourceMapSegment[] for every line
		for (let i = 0; i < line_count; i++) map.mappings.push([]);
		return new StringWithSourcemap(string, map);
	}

	static from_source(
		source_file: string, source: string, offset?: SourceLocation
	): StringWithSourcemap {
		if (!offset) offset = { line: 0, column: 0 };
		const map: DecodedSourceMap = { version: 3, names: [], sources: [source_file], mappings: [] };
		if (source == '') return new StringWithSourcemap(source, map);

		// we create a high resolution identity map here,
		// we know that it will eventually be merged with svelte's map,
		// at which stage the resolution will decrease.
		const line_list = source.split('\n');
		for (let line = 0; line < line_list.length; line++) {
			map.mappings.push([]);
			const token_list = line_list[line].split(/([^\d\w\s]|\s+)/g);
			for (let token = 0, column = 0; token < token_list.length; token++) {
				if (token_list[token] == '') continue;
				map.mappings[line].push([column, 0, offset.line + line, column]);
				column += token_list[token].length;
			}
		}
		// shift columns in first line
		const segment_list = map.mappings[0];
		for (let segment = 0; segment < segment_list.length; segment++) {
			segment_list[segment][3] += offset.column;
		}
		return new StringWithSourcemap(source, map);
	}
}

export function combine_sourcemaps(
	filename: string,
	sourcemap_list: Array<DecodedSourceMap | RawSourceMap>
): RawSourceMap {
	if (sourcemap_list.length == 0) return null;

	let map_idx = 1;
	const map: RawSourceMap =
		sourcemap_list.slice(0, -1)
			.find(m => m.sources.length !== 1) === undefined

			? remapping( // use array interface
				// only the oldest sourcemap can have multiple sources
				sourcemap_list,
				() => null,
				true // skip optional field `sourcesContent`
			)

			: remapping( // use loader interface
				sourcemap_list[0], // last map
				function loader(sourcefile) {
					if (sourcefile === filename && sourcemap_list[map_idx]) {
						return sourcemap_list[map_idx++]; // idx 1, 2, ...
						// bundle file = branch node
					} else {
						return null; // source file = leaf node
					}
				} as SourceMapLoader,
				true
			);

	if (!map.file) delete map.file; // skip optional field `file`

	return map;
}

// browser vs node.js
const b64enc = typeof btoa == 'function' ? btoa : b => Buffer.from(b).toString('base64');

export function apply_preprocessor_sourcemap(filename: string, svelte_map: SourceMap, preprocessor_map_input: string | DecodedSourceMap | RawSourceMap): SourceMap {
	if (!svelte_map || !preprocessor_map_input) return svelte_map;

	const preprocessor_map = typeof preprocessor_map_input === 'string' ? JSON.parse(preprocessor_map_input) : preprocessor_map_input;

	const result_map = combine_sourcemaps(
		filename,
		[
			svelte_map as RawSourceMap,
			preprocessor_map
		]
	) as RawSourceMap;

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

	return result_map as SourceMap;
}
