import { DecodedSourceMap, SourceMapSegment } from '@ampproject/remapping/dist/types/types';

type SourceLocation = {
	line: number;
	column: number;
};

function last_line_length(s: string) {
	return s.length - s.lastIndexOf('\n') - 1;
}

// mutate map in-place
export function sourcemap_add_offset(
	map: DecodedSourceMap, offset: SourceLocation
) {
	// shift columns in first line
	const m = map.mappings;
	m[0].forEach(seg => {
		if (seg[3]) seg[3] += offset.column;
	});
	// shift lines
	m.forEach(line => {
		line.forEach(seg => {
			if (seg[2]) seg[2] += offset.line;
		});
	});
}

function merge_tables<T>(this_table: T[], other_table): [T[], number[], boolean, boolean] {
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
	for (let i = 0; i < other.length; i++)
		_this.push(other[i]);
}

export class StringWithSourcemap {
	string: string;
	map: DecodedSourceMap;

	constructor(string = '', map = null) {
		this.string = string;
		if (map)
			this.map = map as DecodedSourceMap;
		else
			this.map = {
				version: 3,
				mappings: [],
				sources: [],
				names: []
			};
	}

	// concat in-place (mutable), return this (chainable)
	// will also mutate the `other` object
	concat(other: StringWithSourcemap): StringWithSourcemap {
		// noop: if one is empty, return the other
		if (other.string == '') return this;
		if (this.string == '') {
			this.string = other.string;
			this.map = other.map;
			return this;
		}

		this.string += other.string;

		const m1 = this.map;
		const m2 = other.map;

		// combine sources and names
		const [sources, new_source_idx, sources_changed, sources_idx_changed] = merge_tables(m1.sources, m2.sources);
		const [names, new_name_idx, names_changed, names_idx_changed] = merge_tables(m1.names, m2.names);

		if (sources_changed) m1.sources = sources;
		if (names_changed) m1.names = names;

		// unswitched loops are faster
		if (sources_idx_changed && names_idx_changed) {
			m2.mappings.forEach(line => {
				line.forEach(seg => {
					if (seg[1]) seg[1] = new_source_idx[seg[1]];
					if (seg[4]) seg[4] = new_name_idx[seg[4]];
				});
			});
		} else if (sources_idx_changed) {
			m2.mappings.forEach(line => {
				line.forEach(seg => {
					if (seg[1]) seg[1] = new_source_idx[seg[1]];
				});
			});
		} else if (names_idx_changed) {
			m2.mappings.forEach(line => {
				line.forEach(seg => {
					if (seg[4]) seg[4] = new_name_idx[seg[4]];
				});
			});
		}

		// combine the mappings

		// combine
		// 1. last line of first map
		// 2. first line of second map
		// columns of 2 must be shifted

		const column_offset = last_line_length(this.string);
		if (m2.mappings.length > 0 && column_offset > 0) {
			// shift columns in first line
			m2.mappings[0].forEach(seg => {
				seg[0] += column_offset;
			});
		}

		// combine last line + first line
		pushArray(m1.mappings[m1.mappings.length - 1], m2.mappings.shift());

		// append other lines
		pushArray(m1.mappings, m2.mappings);

		return this;
	}

	static from_processed(string: string, map?: DecodedSourceMap): StringWithSourcemap {
		if (map) return new StringWithSourcemap(string, map);
		map = { version: 3, names: [], sources: [], mappings: [] };
		if (string == '') return new StringWithSourcemap(string, map);
		// add empty SourceMapSegment[] for every line
		const lineCount = string.split('\n').length;
		map.mappings = Array.from({length: lineCount}).map(_ => []);
		return new StringWithSourcemap(string, map);
	}

	static from_source(
		source_file: string, source: string, offset_in_source?: SourceLocation
	): StringWithSourcemap {
		const offset = offset_in_source || { line: 0, column: 0 };
		const map: DecodedSourceMap = { version: 3, names: [], sources: [source_file], mappings: [] };
		if (source.length == 0) return new StringWithSourcemap(source, map);

		// we create a high resolution identity map here,
		// we know that it will eventually be merged with svelte's map,
		// at which stage the resolution will decrease.
		map.mappings = source.split("\n").map((line, line_idx) => {
			let pos = 0;
			const segs = line.split(/([^\d\w\s]|\s+)/g)
				.filter(s => s !== "").map(s => {
					const seg: SourceMapSegment = [
						pos, 0,
						line_idx + offset.line,
						pos + (line_idx == 0 ? offset.column : 0) // shift first line
					];
					pos = pos + s.length;
					return seg;
				});
			return segs;
		});
		return new StringWithSourcemap(source, map);
	}
}
