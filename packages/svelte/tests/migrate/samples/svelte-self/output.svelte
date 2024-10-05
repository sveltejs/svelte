<script>
	import SvelteSelf from './output.svelte';
	/** @type {Record<string, any>} */
	let { ...props } = $props();
</script>

{#if false}
	<SvelteSelf />
	<SvelteSelf with_attributes/>
	<SvelteSelf count={count+1}/>
	<SvelteSelf>
		child
	</SvelteSelf>
	<SvelteSelf count={count+1}>
		child
	</SvelteSelf>
	<SvelteSelf count={props.count}     >
		child
	</SvelteSelf>
	<SvelteSelf></SvelteSelf>
{/if}