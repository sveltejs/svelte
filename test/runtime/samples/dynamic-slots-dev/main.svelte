<script>
	import Nested from './Nested.svelte';

  let slot = 'dynamic-slot';

  function y() {
    slot = 'another-slot';
  }
</script>

<Nested>
	<p slot={slot}>Hello</p>
	<p slot='default'>Hello</p>
	<p slot='static'>Hello</p>
  <p slot={`${slot}-again`}>Hello</p>
</Nested>
