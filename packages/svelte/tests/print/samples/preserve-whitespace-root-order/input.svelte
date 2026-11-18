<!-- before the module -->
<script module>
	export const label = 'label';
</script>

<p>  before the options  </p>
<svelte:options preserveWhitespace />


<!-- before the instance -->
<script lang="ts">
	let value = $state('value');
</script>

<p>  {label}  {value}  </p>

<style></style>


<p>  after the style  </p>
