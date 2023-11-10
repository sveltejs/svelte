import { test } from '../../test';

export default test({
	compileOptions: {
		preserveWhitespace: true
	},

	html: `<pre id="pre">  A
  B
  <span>
    C
    D
  </span>
  E
  F
</pre>

<div id="div">
  A
  B
  <span>
    C
    D
  </span>
  E
  F
</div>

<div id="div-with-pre">
  <pre>    A
    B
    <span>
      C
      D
    </span>
    E
    F
  </pre>
</div>`
});
