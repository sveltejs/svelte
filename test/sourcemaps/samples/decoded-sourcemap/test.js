export function test({ assert, input, preprocessed }) {

  const expected = input.locate('replace me');

  const start = preprocessed.locate('success');

  const actualbar = preprocessed.mapConsumer.originalPositionFor({
    line: start.line + 1,
    column: start.column
  });

  assert.deepEqual(actualbar, {
    source: 'input.svelte',
    name: 'replace me',
    line: expected.line + 1,
    column: expected.column
  });

}
