<script>
	let show_extra = false;
	const attributes = { 'aria-label': 'choice' };

	export function toggle() {
		show_extra = !show_extra;
	}
</script>

<select {...attributes}>
	<option value="">Choose an option</option>
	<option value="first">First</option>
	{#if show_extra}
		<option value="extra">Extra</option>
	{/if}
</select>
