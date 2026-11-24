<script>
	let open = $state(true);
	let toggles = $state(0);
</script>

<dialog bind:open ontoggle={() => toggles++}>
	<button class="inside">inside</button>
</dialog>
<button class="toggle" onclick={() => (open = !open)}>toggle</button>
<p>{open} {toggles}</p>
