<script lang="ts">
	let presses = $state(0);
</script>

<button onpress={(event: { amount: number }) => (presses += event.amount)}>{presses}</button>
