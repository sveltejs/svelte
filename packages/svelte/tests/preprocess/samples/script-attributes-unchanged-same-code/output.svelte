<script lang="ts" generics='T extends "a" | "b"'>
	let { value }: { value: T } = $props();
</script>

<p>{value}</p>
