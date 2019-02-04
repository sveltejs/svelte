import * as assert from 'assert';
import './main.html';

export default function (target) {
  const el = target.ownerDocument.body.querySelector('custom-element');
  const p = el.shadowRoot.querySelector('p');
  assert.equal(p.textContent, 'Hello world');
}