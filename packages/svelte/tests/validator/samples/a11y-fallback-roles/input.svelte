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

<!-- valid -->
<div role="BUTTON link" aria-pressed="false" tabindex="0" onclick={handler} onkeydown={handler}></div>
<div role="&#9;button&#10;&#13;&#12;link&#9;" aria-pressed="false" tabindex="0" onclick={handler} onkeydown={handler}></div>
<div role={'button'} aria-pressed="false" onclick={handler} onkeydown={handler}></div>
<div role=""></div>
<div role="&#9;&#10;&#13;&#12; "></div>

<!-- invalid -->
<div role="button&nbsp;link" tabindex="0" onclick={handler} onkeydown={handler}></div>
<div role="&nbsp;button&nbsp;" tabindex="0" onclick={handler} onkeydown={handler}></div>
<div role="widget bogus" aria-checked="true" onkeydown={handler}></div>
<div role="bogus widget" aria-checked="true" onkeydown={handler}></div>
<div role="bogus button" aria-pressed="false" tabindex="0" onclick={handler} onkeydown={handler}></div>
<div role="widget button" aria-pressed="false" tabindex="0" onclick={handler} onkeydown={handler}></div>
<div role="lin&#x212A; button" aria-pressed="false" tabindex="0" onclick={handler} onkeydown={handler}></div>
