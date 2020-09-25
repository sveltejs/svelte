type MappingSegment =
	| [number]
	| [number, number, number, number]
	| [number, number, number, number, number];

type SourceMappings = {
	sources: string[];
	names: string[];
	mappings: MappingSegment[][];
};

type SourceLocation = {
	line: number;
	column: number;
};

function last_line_length(s: string) {
	return s.length - s.lastIndexOf('\n') - 1;
}

export function sourcemap_add_offset(
	map: SourceMappings, offset: SourceLocation
): SourceMappings {
	return {
		sources: map.sources.slice(),
		mappings: map.mappings.map((line, line_idx) =>
			line.map(seg => {
				const new_seg = seg.slice() as MappingSegment;
				if (seg.length >= 4) {
					new_seg[2] = new_seg[2] + offset.line;
					if (line_idx == 0)
						new_seg[3] = new_seg[3] + offset.column;
				}
				return new_seg;
			})
		)
	} as SourceMappings;
}

function merge_tables<T>(this_table: T[], other_table): [T[], number[], boolean] {
	const new_table = this_table.slice();
	const idx_map = [];
	other_table = other_table || [];
	let has_changed = false;
	for (const [other_idx, other_val] of other_table.entries()) {
		const this_idx = this_table.indexOf(other_val);
		if (this_idx >= 0) {
			idx_map[other_idx] = this_idx;
		} else {
			const new_idx = new_table.length;
			new_table[new_idx] = other_val;
			idx_map[other_idx] = new_idx;
			has_changed = true;
		}
	}
	if (has_changed) {
		if (idx_map.find((val, idx) => val != idx) === undefined) {
			// idx_map is identity map [0, 1, 2, 3, 4, ....]
			has_changed = false;
		}
	}
	return [new_table, idx_map, has_changed];
}

export class StringWithSourcemap {
	readonly string: string;
	readonly map: SourceMappings;

	constructor(string: string, map: SourceMappings) {
		this.string = string;
		this.map = map;
	}

	concat(other: StringWithSourcemap): StringWithSourcemap {
		// noop: if one is empty, return the other
		if (this.string == '') return other;
		if (other.string == '') return this;

		// combine sources and names
		const [sources, new_source_idx, sources_changed] = merge_tables(this.map.sources, other.map.sources);
		const [names, new_name_idx, names_changed] = merge_tables(this.map.names, other.map.names);

		// update source refs and name refs
		const other_mappings =
			(sources_changed || names_changed)
				? other.map.mappings.slice().map(line =>
						line.map(seg => {
							if (seg[1]) seg[1] = new_source_idx[seg[1]];
							if (seg[4]) seg[4] = new_name_idx[seg[4]];
							return seg;
						})
					)
				: other.map.mappings;

		// combine the mappings

		// combine
		// 1. last line of first map
		// 2. first line of second map
		// columns of 2 must be shifted

		const column_offset = last_line_length(this.string);

		const first_line: MappingSegment[] =
			other_mappings.length == 0
				? []
				: column_offset == 0
					? other_mappings[0].slice() as MappingSegment[]
					: other_mappings[0].slice().map(seg => {
							// shift column
							seg[0] += column_offset;
							return seg;
						});

		const mappings: MappingSegment[][] =
			this.map.mappings.slice(0, -1)
			.concat([
				this.map.mappings.slice(-1)[0] // last line
				.concat(first_line)
			])
			.concat(other_mappings.slice(1) as MappingSegment[][]);

		return new StringWithSourcemap(
			this.string + other.string,
			{ sources, names, mappings }
		);
	}

	static from_processed(string: string, map?: SourceMappings): StringWithSourcemap {
		if (map) return new StringWithSourcemap(string, map);
		map = { names: [], sources: [], mappings: [] };
		if (string == '') return new StringWithSourcemap(string, map);
		// add empty MappingSegment[] for every line
		const lineCount = string.split('\n').length;
		map.mappings = Array.from({length: lineCount}).map(_ => []);
		return new StringWithSourcemap(string, map);
	}

	static from_source(
		source_file: string, source: string, offset_in_source?: SourceLocation
	): StringWithSourcemap {
		const offset = offset_in_source || { line: 0, column: 0 };
		const map: SourceMappings = { names: [], sources: [source_file], mappings: [] };
		if (source.length == 0) return new StringWithSourcemap(source, map);

		// we create a high resolution identity map here,
		// we know that it will eventually be merged with svelte's map,
		// at which stage the resolution will decrease.
		map.mappings = source.split("\n").map((line, line_idx) => {
			let pos = 0;
			const segs = line.split(/([^\d\w\s]|\s+)/g)
				.filter(s => s !== "").map(s => {
					const seg: MappingSegment = [
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
