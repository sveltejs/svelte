<script>
	let x = $state(1);
	let y = $state(1);
	let z = $derived(x*y);
</script>

<button onclick={() => {
	x = 0;
	// reading a derived value and then setting another source contributing to the derived
	// resulting in the same value should not prevent pending render effects from updating
	z;
	y = 0;
}}>{z}</button>