<script>
	import SvelteSelf_1 from './output.svelte';
	/** @type {Record<string, any>} */
	let { ...props } = $props();
	let SvelteSelf;
</script>

{#if false}
	<SvelteSelf_1/>
	<SvelteSelf_1 with_attributes/>
	<SvelteSelf_1 count={count+1}/>
	<SvelteSelf_1>
		child
	</SvelteSelf_1>
	<SvelteSelf_1 count={count+1}>
		child
	</SvelteSelf_1>
	<SvelteSelf_1 count={props.count}     >
		child
	</SvelteSelf_1>
	<SvelteSelf_1></SvelteSelf_1>
{/if}