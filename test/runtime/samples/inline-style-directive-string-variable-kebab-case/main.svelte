<script>
	let url =
		"https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png";

	let alpha = 1;
</script>

<div
	style:background-image="url({url})"
	style:--css-variable="rgba(0, 0, 0, {alpha})"
/>
