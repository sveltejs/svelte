<script>
	import Component from './Component.svelte';
  export let prop;
  
  const slot_name = 'test';
</script>

<Component {slot_name}>
	<slot name={`${prop}-${prop}`} slot={slot_name} />
</Component>
