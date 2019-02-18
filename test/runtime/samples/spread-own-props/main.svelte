<svelte:options bind:props/>

<script>
	import Widget from './Widget.svelte';

	let props;
</script>

<div>
	<Widget {...props} qux="named"/>
</div>
