<script>
	let open = $state(false);
	let closed = $state(0);
</script>

<dialog bind:open onclose={() => closed++}>
	<form method="dialog"><button class="submit">submit</button></form>
</dialog>
<button class="toggle" onclick={() => (open = !open)}>toggle</button>
<p>{open} {closed}</p>
