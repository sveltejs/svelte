<script>
	import Component4 from './Component4.svelte';
</script>

<Component4>
	<slot name="first" slot="first" />
	<slot name="second" slot="second" />
	<slot name="third" slot="third" />
	<slot name="fourth" slot="fourth">
    <h3>Component 4 fourth default slot</h3>
  </slot>
	<slot name="fifth" slot="fifth" />
</Component4>
