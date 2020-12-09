export interface Processed {
	code: string;
	map?: string | object; // we are opaque with the type here to avoid dependency on the remapping module for our public types.
	dependencies?: string[];
	toString?: () => string;
}

export interface PreprocessorGroup {
	markup?: (options: { content: string; filename: string }) => Processed | Promise<Processed>;
	style?: Preprocessor;
	script?: Preprocessor;
}

export type Preprocessor = (options: {
	content: string;
	attributes: Record<string, string | boolean>;
	filename?: string;
}) => Processed | Promise<Processed>;
