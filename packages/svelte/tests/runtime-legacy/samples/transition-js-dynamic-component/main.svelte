<script>
	import A from './A.svelte';
	import B from './B.svelte';

	export let x;
</script>

<svelte:component this="{x ? A : B}"/>