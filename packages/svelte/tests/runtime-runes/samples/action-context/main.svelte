<script>
	let count = $state(0);

	/**
	 * @param {Element} _
	 * @param {number} count
	 */
	function action(_, count) {
		return {
			count,
			/** @param {number} count */
			update(count) {
				console.log('update', this.count, (this.count = count));
			},
			destroy() {
				console.log('destroy', this.count);
			},
		}
	};
</script>

{#if count < 2}
	<button use:action={count} onclick={() => count++}>
		{count}
	</button>
{/if}
