export interface Config {
	/**
	 * Version group title
	 */
	title: string;
	/**
	 * Git tags config
	 */
	tags: {
		/**
		 * Regex for matching tags. The first numbered capturing group must contain the version name.
		 */
		regex: string;
		/**
		 * Options to filter/title the git tags:
		 * - `"minor"` - only take the latest patch version for every minor version.
		 * 	 Version extracted by the regex must match SemVer. The title is `<major>.<minor>`.
		 * - `undefined` _(default)_ - take every matching tag.
		 *   The title is the version name.
		 */
		filter?: 'minor';
	};
	/**
	 * Path inside the git repo that docs are found at
	 */
	path: string;
	/**
	 * Format of the docs files:
	 * - `flat` - a list of `00_name.md` files
	 * - `sections` - directories with a `meta.json` and a list of `00_name.md` files
	 */
	format: 'flat' | 'sections';
}

export interface VersionGroup {
	title: string;
	id: string;
	versions: Record<string, string>;
}
