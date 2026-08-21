<select value={42}>
  <option>{await Promise.resolve(42)}</option>
</select>