<script lang="ts">
	const identity = (x: any) => x;
</script>

<span>{identity(null)}{identity(undefined)}</span>
