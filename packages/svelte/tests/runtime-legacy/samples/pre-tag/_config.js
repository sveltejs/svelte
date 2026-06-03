import { test } from '../../test';

export default test({
	mode: ['client', 'server'], // output is correct, but test suite chokes on the extra ssr comment which is harmless
	withoutNormalizeHtml: 'only-strip-comments', // because whitespace inside pre tags is significant
	// Note how we're testing against target.innerHTML which already removed the redundant first newline
	html: `<pre id="pre">  A
  B
  <span>
    C
    D
  </span>
  E
  F
</pre> <div id="div">A
  B <span>C
    D</span> E
  F</div> <div id="div-with-pre"><pre>    A
    B
    <span>
      C
      D
    </span>
    E
    F
  </pre></div> <div id="pre-with-leading-newline"><pre>leading newline</pre> <pre>  leading newline and spaces</pre> <pre>
leading newlines</pre></div> <div id="pre-without-leading-newline"><pre>without spaces</pre> <pre>  with spaces  </pre> <pre>${' '}
newline after leading space</pre></div> <pre id="pre-with-multiple-leading-newlines">

multiple leading newlines</pre>`
});
