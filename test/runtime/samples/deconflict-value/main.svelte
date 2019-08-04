<script>
  import Widget from './Widget.svelte';
	let value;
	$: reactive = value;
</script>

<Widget bind:value/>
<p>Reactive: {reactive}</p>
<p>Value: {value}</p>
