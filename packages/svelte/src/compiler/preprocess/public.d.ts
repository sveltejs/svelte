/**
 * The result of a preprocessor run. If the preprocessor does not return a result, it is assumed that the code is unchanged.
 */
export interface Processed {
	/**
	 * The new code
	 */
	code: string;
	/**
	 * A source map mapping back to the original code
	 */
	map?: string | object; // we are opaque with the type here to avoid dependency on the remapping module for our public types.
	/**
	 * A list of additional files to watch for changes
	 */
	dependencies?: string[];
	/**
	 * Only for script/style preprocessors: The updated attributes to set on the tag. If undefined, attributes stay unchanged.
	 */
	attributes?: Record<string, string | boolean>;
	toString?: () => string;
}

/**
 * A markup preprocessor that takes a string of code and returns a processed version.
 */
export type MarkupPreprocessor = (options: {
	/**
	 * The whole Svelte file content
	 */
	content: string;
	/**
	 * The filename of the Svelte file
	 */
	filename?: string;
}) => Processed | void | Promise<Processed | void>;

/**
 * A script/style preprocessor that takes a string of code and returns a processed version.
 */
export type Preprocessor = (options: {
	/**
	 * The script/style tag content
	 */
	content: string;
	/**
	 * The attributes on the script/style tag
	 */
	attributes: Record<string, string | boolean>;
	/**
	 * The whole Svelte file content
	 */
	markup: string;
	/**
	 * The filename of the Svelte file
	 */
	filename?: string;
}) => Processed | void | Promise<Processed | void>;

/**
 * A preprocessor group is a set of preprocessors that are applied to a Svelte file.
 */
export interface PreprocessorGroup {
	/** Name of the preprocessor. Will be a required option in the next major version */
	name?: string;
	markup?: MarkupPreprocessor;
	style?: Preprocessor;
	script?: Preprocessor;
}

/**
 * Utility type to extract the type of a preprocessor from a preprocessor group
 */
export interface SveltePreprocessor<
	PreprocessorType extends keyof PreprocessorGroup,
	Options = any
> {
	(options?: Options): Required<Pick<PreprocessorGroup, PreprocessorType>>;
}
