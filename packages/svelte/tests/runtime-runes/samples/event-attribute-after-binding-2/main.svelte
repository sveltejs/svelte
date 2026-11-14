<script>
	let open = $state(false);
	let open_copy = $state(false);
</script>

<details bind:open ontoggle={() => (open_copy = open)}>
	<summary>summary</summary>
</details>

<p>{open} {open_copy}</p>
