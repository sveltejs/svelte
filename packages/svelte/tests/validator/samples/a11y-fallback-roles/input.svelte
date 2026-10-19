<script>
	function handler() {}
</script>

<!-- valid -->
<div role="switch checkbox" aria-checked="false" tabindex="0" onclick={handler} onkeydown={handler}></div>
<div role="tab button" aria-selected="true" tabindex="0" onclick={handler} onkeydown={handler}></div>
<div role="none presentation" onclick={handler}></div>
<div role=" button " tabindex="0" onclick={handler} onkeydown={handler}></div>

<!-- invalid -->
<div role="button link" aria-checked="true" tabindex="0" onclick={handler} onkeydown={handler}></div>
