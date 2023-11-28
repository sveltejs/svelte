<script lang="ts">
	let count = $state(1) as number;
	let double = $derived(count * 2) as number;
</script>

{count} {double}
