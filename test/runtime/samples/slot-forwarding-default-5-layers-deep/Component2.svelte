<script>
	import Component3 from './Component3.svelte';
</script>

<Component3>
	<slot name="first" slot="first" />
	<slot name="second" slot="second" />
	<slot name="third" slot="third">
    <h3>Component 3 third default slot</h3>
  </slot>
	<slot name="fourth" slot="fourth" />
	<slot name="fifth" slot="fifth" />
</Component3>
