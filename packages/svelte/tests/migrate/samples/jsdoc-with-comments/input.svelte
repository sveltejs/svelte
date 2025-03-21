<script>
	/**
	 * My wonderful comment
	 * @type {string}
	 */
	export let comment;

	/**
	 * My wonderful other comment
	 * @type {number}
	 */	
	export let another_comment;

	// one line comment
	export let one_line;

	export let no_comment;

	/**
	 * @type {boolean}
	 */
	export let type_no_comment;

	/** @type {boolean} type_with_comment - One-line declaration with comment */
	export let type_with_comment;

	/**
	 * This is optional
	 */
	export let optional = {stuff: true};
	
	export let inline_commented; // this should stay a comment

	/**
	 * This comment should be merged
	 */
	export let inline_commented_merged; // with this inline comment

	/*
	* this is a same-line leading multiline comment
	**/ export let inline_multiline_leading_comment = 'world';

	export let inline_multiline_trailing_comment = 'world'; /*
	* this is a same-line trailing multiline comment
	**/

	/** @type {number} [default_value=1] */
	export let default_value = 1;

	/** @type {number} [comment_default_value=1] - This has a comment and an optional value. */
	export let comment_default_value = 1;
</script>