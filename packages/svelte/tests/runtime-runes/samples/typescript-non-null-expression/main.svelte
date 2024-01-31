<script lang="ts">
	let count = $state(1)!;
	let double = $derived(count! * 2)!;
	let binding = $state(null);
</script>

{count!} {double!}

<input type="number" bind:value={binding!} />
