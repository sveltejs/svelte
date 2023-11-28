<script lang="ts">
	let count = $state(1)!;
	let double = $derived(count! * 2)!;
</script>

{count!} {double!}
