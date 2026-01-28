<script lang="ts">
	let { rows = $bindable([]), row } = $props();
	rows[row] = '';
</script>

