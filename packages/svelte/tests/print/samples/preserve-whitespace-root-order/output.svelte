<svelte:options preserveWhitespace /><script module>
	export const label = 'label';
</script><script lang="ts">
	let value = $state('value');
</script><!-- before the module -->


<p>  before the options  </p>



<!-- before the instance -->


<p>  {label}  {value}  </p>




<p>  after the style  </p><style></style>