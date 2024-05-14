<!-- valid -->
<button></button>
<button tabindex='0'></button>
<button tabindex='{0}'></button>
<div></div>
<div tabindex='-1'></div>
<div role='button' tabindex='0'></div>
<div role='article' tabindex='-1'></div>
<article tabindex='-1'></article>
<div role="tabpanel" tabindex='0'></div>
<svelte:element this={Math.random() ? 'button' : 'div'} tabindex="0" />
<!-- invalid -->
<div tabindex='0'></div>
<div role='article' tabindex='0'></div>
<article tabindex='0'></article>
<article tabindex='{0}'></article>
