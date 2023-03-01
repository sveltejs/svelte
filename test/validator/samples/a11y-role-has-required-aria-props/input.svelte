<div role="heading"></div>
<span role="checkbox"></span>
<div role="meter"></div>
<div role="scrollbar"></div>

<div role="heading" aria-level="1"></div>
<span role="checkbox" aria-checked="false"></span>
<div role="meter" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
<div role="scrollbar" aria-controls="panel" aria-valuenow="50"></div>
<input role="switch" type="checkbox" />
<svelte:element this={Math.random() ? 'input' : 'div'} role="checkbox" />
