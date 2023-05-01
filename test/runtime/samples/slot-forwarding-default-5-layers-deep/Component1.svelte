<script>
	import Component2 from './Component2.svelte';
</script>

<Component2>
	<slot name="first" slot="first" />
	<slot name="second" slot="second">
    <h3>Component 2 second default slot</h3>
  </slot>
	<slot name="third" slot="third" />
	<slot name="fourth" slot="fourth" />
	<slot name="fifth" slot="fifth" />
</Component2>
