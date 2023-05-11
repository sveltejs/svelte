import { DecodedSourceMap } from '@ampproject/remapping';
import { Location } from 'locate-character';

export interface Source {
	source: string;
	get_location: (search: number) => Location;
	file_basename: string;
	filename?: string;
}

export interface SourceUpdate {
	string?: string;
	map?: DecodedSourceMap;
	dependencies?: string[];
}
