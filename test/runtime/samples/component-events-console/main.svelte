<script>
	import Widget from './Widget.svelte';
</script>

<Widget on:click="{() => console.log('clicked')}"/>