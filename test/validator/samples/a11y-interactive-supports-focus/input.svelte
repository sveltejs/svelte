<!-- VALID -->
<div aria-hidden role="button" on:keypress={() => {}} />
<div aria-disabled role="button" on:keypress={() => {}} />
<div disabled role="button" on:keypress={() => {}} />
<div role="presentation" on:keypress={() => {}} />
<button on:click={() => {}} />
<div role="menuitem" tabindex="0" on:click={() => {}} on:keypress={() => {}} />
<div role="button" tabindex="-1" on:click={() => {}} on:keypress={() => {}} />

<!-- INVALID -->
<div role="button" on:keypress={() => {}} />
<span role="menuitem" on:keydown={() => {}} />
