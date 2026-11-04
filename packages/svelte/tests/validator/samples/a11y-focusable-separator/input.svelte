<!-- valid: a separator with tabindex is a focusable widget (window splitter) -->
<div role="separator" tabindex="0" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
<span role="separator" tabindex="0" aria-valuenow="50" onkeydown={() => {}}></span>
<div role="separator" tabindex="-1" aria-valuenow="50" onkeydown={() => {}}></div>
<div role="separator"></div>
<hr />
