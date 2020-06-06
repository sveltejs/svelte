import { encode } from "sourcemap-codec";

type MappingSegment = [ number ] | [ number, number, number, number ] |  [ number, number, number, number, number ]

type SourceMappings = {
    sources: string[];
    names: string[];
    mappings: MappingSegment[][];
}

type SourceLocation = {
    line: number;
    column: number;
}

function get_end_location(s: string): SourceLocation {
    const parts = s.split('\n');
    return {
        line: parts.length - 1,
        column: parts[parts.length - 1].length - 1
    };
}


export function offset_source_location(offset: SourceLocation, map: SourceMappings): SourceMappings {
 
    const new_mappings = map.mappings.map(line => line.map(seg => {
        if (seg.length < 3) return seg;
        const new_seg = seg.slice() as MappingSegment;
        new_seg[2] = new_seg[2] + offset.line;
        return new_seg;
    }));

    // first line has column altered
    if (new_mappings.length > 0) {
        new_mappings[0] = new_mappings[0].map(seg => {
            if (seg.length < 4) return seg;
            const newSeg = seg.slice() as MappingSegment;
            newSeg[3] = newSeg[3] + offset.column;
            return newSeg;
        });
    }
    
    return {
        sources: map.sources,
        mappings: new_mappings
    } as SourceMappings;
}



function merge_tables<T>( original: T[], extended: T[]): { table: T[]; new_idx: number[] } {
    const table = original.slice();
        const new_idx = [];
        for (let j = 0; j < original.length; j++) {
            const current = extended[j];
            const existing = table.indexOf(current);
            if (existing < 0) {
                table.push(current);
                new_idx[j] = table.length - 1;
            } else {
                new_idx[j] = existing;
            }
        }
    return { table, new_idx }; 
}



export class GeneratedStringWithMap {
    readonly generated: string;
    readonly map: SourceMappings;

    constructor(generated: string , map: SourceMappings) {
        this.generated = generated;
        this.map = map;
    }
 
    as_sourcemap() {
        return {
            version: 3,
            sources: this.map.sources,
            names: [],
            mappings: encode(this.map.mappings as any)
        };
    }
    
    concat(other: GeneratedStringWithMap): GeneratedStringWithMap {
        // if one is empty, return the other
        if (this.generated.length == 0) return other;
        if (other.generated.length == 0) return this;
    
        //combine sources
        const { table: new_sources, new_idx: other_source_idx } = merge_tables(this.map.sources, other.map.sources);
        const { table: new_names, new_idx: other_name_idx } = merge_tables(this.map.names, other.map.names);

        //update source and name references in segments
        const other_mappings = other.map.mappings.map(line => line.map(seg => {
            //to reduce allocations, we only return a new segment if a value has changed
            if (
                (seg.length > 1 && other_source_idx[seg[1]] != seg[1]) // has source idx that has been updated
                || (seg.length == 5 && other_name_idx[seg[4]] != seg[4]))  // has name idx that has been updated
                {
                const new_seg = seg.slice() as MappingSegment;
                new_seg[1] = other_source_idx[seg[1]];
                if (seg.length == 5) {
                    new_seg[4] = other_name_idx[seg[4]];
                }
                return new_seg;
            } else {
                return seg;
            }
        }));
    
        //combine the mappings
        let new_mappings = this.map.mappings.slice();
        
        //shift the first line of the second mapping by the number of columns in the last line of the first
        const end = get_end_location(this.generated);
        const col_offset = end.column + 1;
        const first_line = other_mappings.length == 0 ? [] : other_mappings[0].map(seg => {
            const new_seg = seg.slice() as MappingSegment;
            new_seg[0] = seg[0] + col_offset;
            return new_seg;
        });
        new_mappings[new_mappings.length - 1] = new_mappings[new_mappings.length - 1].concat(first_line);
       
        //the rest don't need modification and can just be appended
        new_mappings = new_mappings.concat(other_mappings.slice(1) as MappingSegment[][]);

        return new GeneratedStringWithMap(this.generated + other.generated, {
            sources: new_sources,
            names: new_names,
            mappings: new_mappings
        });
    }


    static from_generated(generated: string, map?: SourceMappings): GeneratedStringWithMap {
        if (map) return new GeneratedStringWithMap(generated, map);
        
        const replacement_map: SourceMappings = {
            names: [],
            sources: [],
            mappings: []
        };

        if (generated.length == 0) return new GeneratedStringWithMap(generated, replacement_map);
        
        // we generate a mapping where the source was overwritten by the generated
        const end = get_end_location(generated);
        for (let i = 0; i <= end.line; i++) {
            replacement_map.mappings.push([]); // unmapped line
        }
    
        return new GeneratedStringWithMap(generated, replacement_map);
    }


 
    static from_source(source_file: string, source: string, offset_in_source?: SourceLocation): GeneratedStringWithMap {
        const offset = offset_in_source || { line: 0, column: 0 };
        const map: SourceMappings = {
            names: [],
            sources: [ source_file ],
            mappings: []
        };

        if (source.length == 0) return new GeneratedStringWithMap(source, map);

        // we create a high resolution identity map here, we know that it will eventually be 
        // merged with svelte's map, at which stage the resolution will decrease.
        const lines = source.split('\n');
        let pos = 0;
        const identity_map = lines.map((line, line_idx) => {
            const segs = line.split(/([^\d\w\s]|\s+)/g).filter(x => x !== "").map(s => {
                const seg: MappingSegment = [pos, 0, offset.line + line_idx, pos + (line_idx == 0 ? offset.column : 0)];
                pos = pos + s.length;
                return seg;
            });
            pos = 0;
            return segs;
        });

        map.mappings = identity_map;
        
        return new GeneratedStringWithMap(source, map);
    }
}