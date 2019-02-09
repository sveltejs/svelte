<script>
	import Widget from './Widget.svelte';

	export let props;
</script>

<div>
	<Widget {...props} qux="named"/>
</div>
