<svelte:options immutable />

<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [count]
	 */

	/** @type {Props} */
	let { count = 0 } = $props();

	export {
		count,
	}
</script>

<p>{count}</p>