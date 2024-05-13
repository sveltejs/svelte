<!-- VALID -->
<input />
<input tabindex="0" />
<input aria-activedescendant="some-id" />
<input aria-activedescendant="some-id" tabindex={0} />
<input aria-activedescendant="some-id" tabindex={1} />
<input aria-activedescendant="some-id" tabindex="0" />
<input aria-activedescendant="some-id" tabindex={-1} />
<input aria-activedescendant="some-id" tabindex="-1" />
<svelte:element this={Math.random() ? 'input' : 'button'} aria-activedescendant="some-id" />
<div></div>
<div aria-activedescendant="some-id" role="tablist" tabindex={-1}></div>
<div aria-activedescendant="some-id" role="tablist" tabindex="-1"></div>

<!-- INVALID -->
<div aria-activedescendant="some-id"></div>
