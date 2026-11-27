<script>
	import Child from './Child.svelte';
</script>

<div class="{classes}"></div>
<div class={classes}></div>
<div title="{value}"></div>
<Child prop="{value}" />
<Child prop={value} />
