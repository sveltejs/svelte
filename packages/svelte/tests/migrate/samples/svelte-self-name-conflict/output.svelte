<script>
	import Output_1 from './output.svelte';
	/** @type {{ [key: string]: any }} */
	let { ...props } = $props();
	let Output;
</script>

{#if false}
	<Output_1 />
	<Output_1 with_attributes/>
	<Output_1 count={count+1}/>
	<Output_1>
		child
	</Output_1>
	<Output_1 count={count+1}>
		child
	</Output_1>
	<Output_1 count={props.count}     >
		child
	</Output_1>
	<Output_1></Output_1>
{/if}