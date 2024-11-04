<script>
	

		

	


	

	
	

	
	/**
	 * @typedef {Object} Props
	 * @property {string} comment - My wonderful comment
	 * @property {number} another_comment - My wonderful other comment
	 * @property {any} one_line - one line comment
	 * @property {any} no_comment
	 * @property {boolean} type_no_comment
	 * @property {any} [optional] - This is optional
	 * @property {any} inline_commented - this should stay a comment
	 * @property {any} inline_commented_merged - This comment should be merged - with this inline comment
	 */

	/** @type {Props} */
	let {
		comment,
		another_comment,
		one_line,
		no_comment,
		type_no_comment,
		optional = {stuff: true},
		inline_commented,
		inline_commented_merged
	} = $props();
</script>