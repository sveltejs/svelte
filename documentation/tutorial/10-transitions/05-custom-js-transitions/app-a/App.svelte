<script>
	let visible = false;

	function typewriter(node, { speed = 50 }) {
		// implementation goes here

		return {

		};
	}
</script>

<label>
	<input type="checkbox" bind:checked={visible}>
	visible
</label>

{#if visible}
	<p in:typewriter>
		The quick brown fox jumps over the lazy dog
	</p>
{/if}