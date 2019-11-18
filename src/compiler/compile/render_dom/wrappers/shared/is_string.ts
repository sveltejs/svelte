export function is_string(node) {
  return node.type === 'TemplateLiteral' || (node.type === 'Literal' && typeof node.value === 'string');
}