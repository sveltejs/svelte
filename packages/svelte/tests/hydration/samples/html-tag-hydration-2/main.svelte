<script lang="ts">
	let { browser } = $props();
</script>

{@html browser ? 'browser' : 'server'}
