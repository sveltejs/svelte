<script lang="ts">
	let count = $state(1) as number;
	let double = $derived(count as number * 2) as number;
</script>

{count as number} {double as number}
