import { Location } from 'locate-character';

export interface Source {
	source: string;
	get_location: (search: number) => Location;
	file_basename: string;
	filename: string;
}

export interface Processed {
	code: string;
	map?: string | object; // we are opaque with the type here to avoid dependency on the remapping module for our public types.
	dependencies?: string[];
	toString?: () => string;
}

export type MarkupPreprocessor = (options: {
	content: string;
	filename: string;
}) => Processed | Promise<Processed>;

export type Preprocessor = (options: {
	/**
	 * The script/style tag content
	 */
	content: string;
	attributes: Record<string, string | boolean>;
	/**
	 * The whole Svelte file content
	 */
	markup: string;
	filename?: string;
}) => Processed | Promise<Processed>;

export interface PreprocessorGroup {
	markup?: MarkupPreprocessor;
	style?: Preprocessor;
	script?: Preprocessor;
}
