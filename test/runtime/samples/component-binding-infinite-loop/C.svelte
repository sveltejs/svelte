<script>
	export let currentIdentifier;
	export let identifier;

	let isCurrentlySelected;

	function toggle() {
		currentIdentifier = isCurrentlySelected ? null : identifier
	}

	$: isCurrentlySelected = currentIdentifier === identifier;
</script>

<span
	on:click="{toggle}"
	class="{isCurrentlySelected ? 'selected' : ''}"
>
	<slot></slot>
</span>