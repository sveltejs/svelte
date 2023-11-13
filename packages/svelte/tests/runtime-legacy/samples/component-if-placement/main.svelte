<script>
	import Component from './Component.svelte';
	export let flag;
</script>

<span>Before</span>
{#if flag}
	<Component/>
{:else}
	<Component/>
{/if}
<span>After</span>