import { Node } from '../interfaces';
import { walk } from 'estree-walker';

export default function walkThroughTopFunctionScope(body: Node, callback: Function) {
  let lexicalDepth = 0;
  walk(body, {
    enter(node: Node) {
      if (/^Function/.test(node.type)) {
        lexicalDepth += 1;
      } else if (lexicalDepth === 0) {
        callback(node)
      }
    },

    leave(node: Node) {
      if (/^Function/.test(node.type)) {
        lexicalDepth -= 1;
      }
    },
  });
}
