<select on:change={e => {}}>
    <option>foo</option>
    <option>bar</option>
</select>
<select on:change={e => {}} on:blur={e => {}}>
    <option>foo</option>
    <option>bar</option>
</select>
<select>
    <option on:change={e => {}}>foo</option>
    <option>bar</option>
</select>
<select>
    <option on:change={e => {}} on:blur={e => {}}>foo</option>
    <option>bar</option>
</select>