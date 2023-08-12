<script>
  import { omit } from './utils.js';

  export let value;
	
	function onInput(e) {  
    value = e.target.value;
  }

  $: props = omit($$props, 'value');
</script>

<input
	type="text"
	{...props}
	on:input={onInput}
	{value}
/>
