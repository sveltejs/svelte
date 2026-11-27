<!-- invalid: no tabindex, so not a focusable separator -->
<div role="separator" onkeydown={() => {}}></div>
<!-- invalid: <hr> stays non-interactive -->
<hr tabindex="0" />
<hr onkeydown={() => {}} />
<hr role="tab" />
<hr role="separator" tabindex="0" />
