<script>
	import Output from './output.svelte';
	/** @type {{ [key: string]: any }} */
	let { ...props } = $props();
</script>

{#if false}
	<Output />
	<Output with_attributes/>
	<Output count={count+1}/>
	<Output>
		child
	</Output>
	<Output count={count+1}>
		child
	</Output>
	<Output count={props.count}     >
		child
	</Output>
	<Output></Output>
{/if}