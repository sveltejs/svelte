export interface Processed {
	code: string;
	map?: string | object; // we are opaque with the type here to avoid dependency on the remapping module for our public types.
	dependencies?: string[];
	toString?: () => string;
}

export interface PreprocessorGroup {
	markup?: Preprocessor | SyncPreprocessor;
	style?: Preprocessor | SyncPreprocessor;
	script?: Preprocessor | SyncPreprocessor;
}

interface PreprocessorOptions {
	content: string;
	attributes: Record<string, string | boolean>;
	filename?: string;
}

export declare type Preprocessor = (options: PreprocessorOptions) => Promise<Processed>;

export declare type SyncPreprocessor = ((options: PreprocessorOptions) => Processed) & { is_sync: true };
