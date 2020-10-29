import { parse as parse$1, parseExpressionAt as parseExpressionAt$1 } from "https://unpkg.com/acorn@^7.3.1?module";
import { walk } from "https://unpkg.com/estree-walker@latest?module";
import { analyze } from "https://unpkg.com/periscopic@^2.0.1?module";
import { encode } from "https://unpkg.com/sourcemap-codec@^1.4.6?module";

// generate an ID that is, to all intents and purposes, unique
const id = Math.round(Math.random() * 1e20).toString(36);
const re = new RegExp(`_${id}_(?:(\\d+)|(AT)|(HASH))_(\\w+)?`, 'g');

const get_comment_handlers = (comments, raw) => ({

  // pass to acorn options
  onComment: (block, value, start, end) => {
    if (block && /\n/.test(value)) {
      let a = start;
      while (a > 0 && raw[a - 1] !== '\n') a -= 1;

      let b = a;
      while (/[ \t]/.test(raw[b])) b += 1;

      const indentation = raw.slice(a, b);
      value = value.replace(new RegExp(`^${indentation}`, 'gm'), '');
    }

    comments.push({ type: block ? 'Block' : 'Line', value, start, end });
  },

  // pass to estree-walker options
  enter(node) {
    let comment;

    while (comments[0] && comments[0].start < node.start) {
      comment = comments.shift();

      comment.value = comment.value.replace(re, (match, id, at, hash, value) => {
        if (hash) return `#${value}`;
        if (at) return `@${value}`;

        return match;
      });

      const next = comments[0] || node;
      comment.has_trailing_newline =
      comment.type === 'Line' ||
      /\n/.test(raw.slice(comment.end, next.start));


      (node.leadingComments || (node.leadingComments = [])).push(comment);
    }
  },
  leave(node) {
    if (comments[0]) {
      const slice = raw.slice(node.end, comments[0].start);

      if (/^[,) \t]*$/.test(slice)) {
        node.trailingComments = [comments.shift()];
      }
    }
  } });



function handle(node, state) {
  const handler = handlers[node.type];

  if (!handler) {
    throw new Error(`Not implemented ${node.type}`);
  }

  const result = handler(node, state);

  if (node.leadingComments) {
    result.unshift(c(node.leadingComments.map(comment => comment.type === 'Block' ?
    `/*${comment.value}*/${comment.has_trailing_newline ? `\n${state.indent}` : ` `}` :
    `//${comment.value}${comment.has_trailing_newline ? `\n${state.indent}` : ` `}`).join(``)));
  }

  if (node.trailingComments) {
    state.comments.push(node.trailingComments[0]); // there is only ever one
  }

  return result;
}

function c(content, node) {
  return {
    content,
    loc: node && node.loc,
    has_newline: /\n/.test(content) };

}

const OPERATOR_PRECEDENCE = {
  '||': 2,
  '&&': 3,
  '??': 4,
  '|': 5,
  '^': 6,
  '&': 7,
  '==': 8,
  '!=': 8,
  '===': 8,
  '!==': 8,
  '<': 9,
  '>': 9,
  '<=': 9,
  '>=': 9,
  in: 9,
  instanceof: 9,
  '<<': 10,
  '>>': 10,
  '>>>': 10,
  '+': 11,
  '-': 11,
  '*': 12,
  '%': 12,
  '/': 12,
  '**': 13 };


const EXPRESSIONS_PRECEDENCE = {
  ArrayExpression: 20,
  TaggedTemplateExpression: 20,
  ThisExpression: 20,
  Identifier: 20,
  Literal: 18,
  TemplateLiteral: 20,
  Super: 20,
  SequenceExpression: 20,
  MemberExpression: 19,
  CallExpression: 19,
  NewExpression: 19,
  AwaitExpression: 17,
  ClassExpression: 17,
  FunctionExpression: 17,
  ObjectExpression: 17,
  UpdateExpression: 16,
  UnaryExpression: 15,
  BinaryExpression: 14,
  LogicalExpression: 13,
  ConditionalExpression: 4,
  ArrowFunctionExpression: 3,
  AssignmentExpression: 3,
  YieldExpression: 2,
  RestElement: 1 };


function needs_parens(node, parent, is_right) {
  // special case where logical expressions and coalesce expressions cannot be mixed,
  // either of them need to be wrapped with parentheses
  if (
  node.type === 'LogicalExpression' &&
  parent.type === 'LogicalExpression' && (
  parent.operator === '??' && node.operator !== '??' ||
  parent.operator !== '??' && node.operator === '??'))
  {
    return true;
  }

  const precedence = EXPRESSIONS_PRECEDENCE[node.type];
  const parent_precedence = EXPRESSIONS_PRECEDENCE[parent.type];

  if (precedence !== parent_precedence) {
    // Different node types
    return (
      !is_right &&
      precedence === 15 &&
      parent_precedence === 14 &&
      parent.operator === '**' ||
      precedence < parent_precedence);

  }

  if (precedence !== 13 && precedence !== 14) {
    // Not a `LogicalExpression` or `BinaryExpression`
    return false;
  }

  if (node.operator === '**' && parent.operator === '**') {
    // Exponentiation operator has right-to-left associativity
    return !is_right;
  }

  if (is_right) {
    // Parenthesis are used if both operators have the same precedence
    return (
      OPERATOR_PRECEDENCE[node.operator] <=
      OPERATOR_PRECEDENCE[parent.operator]);

  }

  return (
    OPERATOR_PRECEDENCE[node.operator] <
    OPERATOR_PRECEDENCE[parent.operator]);

}

function has_call_expression(node) {
  while (node) {
    if (node.type[0] === 'CallExpression') {
      return true;
    } else if (node.type === 'MemberExpression') {
      node = node.object;
    } else {
      return false;
    }
  }
}

const has_newline = chunks => {
  for (let i = 0; i < chunks.length; i += 1) {
    if (chunks[i].has_newline) return true;
  }
  return false;
};

const get_length = chunks => {
  let total = 0;
  for (let i = 0; i < chunks.length; i += 1) {
    total += chunks[i].content.length;
  }
  return total;
};

const sum = (a, b) => a + b;

const join = (nodes, separator) => {
  if (nodes.length === 0) return [];
  const joined = [...nodes[0]];
  for (let i = 1; i < nodes.length; i += 1) {
    joined.push(separator, ...nodes[i]);
  }
  return joined;
};

const scoped = fn => {
  return (node, state) => {
    return fn(node, {
      ...state,
      scope: state.scope_map.get(node) });

  };
};

const deconflict = (name, names) => {
  const original = name;
  let i = 1;

  while (names.has(name)) {
    name = `${original}$${i++}`;
  }

  return name;
};

const handle_body = (nodes, state) => {
  const chunks = [];

  const body = nodes.map(statement => {
    const chunks = handle(statement, {
      ...state,
      indent: state.indent });


    let add_newline = false;

    while (state.comments.length) {
      const comment = state.comments.shift();
      const prefix = add_newline ? `\n${state.indent}` : ` `;

      chunks.push(c(comment.type === 'Block' ?
      `${prefix}/*${comment.value}*/` :
      `${prefix}//${comment.value}`));

      add_newline = comment.type === 'Line';
    }

    return chunks;
  });

  let needed_padding = false;

  for (let i = 0; i < body.length; i += 1) {
    const needs_padding = has_newline(body[i]);

    if (i > 0) {
      chunks.push(
      c(needs_padding || needed_padding ? `\n\n${state.indent}` : `\n${state.indent}`));

    }

    chunks.push(
    ...body[i]);


    needed_padding = needs_padding;
  }

  return chunks;
};

const handle_var_declaration = (node, state) => {
  const chunks = [c(`${node.kind} `)];

  const declarators = node.declarations.map(d => handle(d, {
    ...state,
    indent: state.indent + (node.declarations.length === 1 ? '' : '\t') }));


  const multiple_lines =
  declarators.some(has_newline) ||
  declarators.map(get_length).reduce(sum, 0) + (state.indent.length + declarators.length - 1) * 2 > 80;


  const separator = c(multiple_lines ? `,\n${state.indent}\t` : ', ');

  if (multiple_lines) {
    chunks.push(...join(declarators, separator));
  } else {
    chunks.push(
    ...join(declarators, separator));

  }

  return chunks;
};

const handlers = {
  Program(node, state) {
    return handle_body(node.body, state);
  },

  BlockStatement: scoped((node, state) => {
    return [
    c(`{\n${state.indent}\t`),
    ...handle_body(node.body, { ...state, indent: state.indent + '\t' }),
    c(`\n${state.indent}}`)];

  }),

  EmptyStatement(node, state) {
    return [];
  },

  ParenthesizedExpression(node, state) {
    return handle(node.expression, state);
  },

  ExpressionStatement(node, state) {
    if (
    node.expression.type === 'AssignmentExpression' &&
    node.expression.left.type === 'ObjectPattern')
    {
      // is an AssignmentExpression to an ObjectPattern
      return [
      c('('),
      ...handle(node.expression, state),
      c(');')];

    }

    return [
    ...handle(node.expression, state),
    c(';')];

  },

  IfStatement(node, state) {
    const chunks = [
    c('if ('),
    ...handle(node.test, state),
    c(') '),
    ...handle(node.consequent, state)];


    if (node.alternate) {
      chunks.push(
      c(' else '),
      ...handle(node.alternate, state));

    }

    return chunks;
  },

  LabeledStatement(node, state) {
    return [
    ...handle(node.label, state),
    c(': '),
    ...handle(node.body, state)];

  },

  BreakStatement(node, state) {
    return node.label ?
    [c('break '), ...handle(node.label, state), c(';')] :
    [c('break;')];
  },

  ContinueStatement(node, state) {
    return node.label ?
    [c('continue '), ...handle(node.label, state), c(';')] :
    [c('continue;')];
  },

  WithStatement(node, state) {
    return [
    c('with ('),
    ...handle(node.object, state),
    c(') '),
    ...handle(node.body, state)];

  },

  SwitchStatement(node, state) {
    const chunks = [
    c('switch ('),
    ...handle(node.discriminant, state),
    c(') {')];


    node.cases.forEach(block => {
      if (block.test) {
        chunks.push(
        c(`\n${state.indent}\tcase `),
        ...handle(block.test, { ...state, indent: `${state.indent}\t` }),
        c(':'));

      } else {
        chunks.push(c(`\n${state.indent}\tdefault:`));
      }

      block.consequent.forEach(statement => {
        chunks.push(
        c(`\n${state.indent}\t\t`),
        ...handle(statement, { ...state, indent: `${state.indent}\t\t` }));

      });
    });

    chunks.push(c(`\n${state.indent}}`));

    return chunks;
  },

  ReturnStatement(node, state) {
    if (node.argument) {
      return [
      c('return '),
      ...handle(node.argument, state),
      c(';')];

    } else {
      return [c('return;')];
    }
  },

  ThrowStatement(node, state) {
    return [
    c('throw '),
    ...handle(node.argument, state),
    c(';')];

  },

  TryStatement(node, state) {
    const chunks = [
    c('try '),
    ...handle(node.block, state)];


    if (node.handler) {
      if (node.handler.param) {
        chunks.push(
        c(' catch('),
        ...handle(node.handler.param, state),
        c(') '));

      } else {
        chunks.push(c(' catch '));
      }

      chunks.push(...handle(node.handler.body, state));
    }

    if (node.finalizer) {
      chunks.push(c(' finally '), ...handle(node.finalizer, state));
    }

    return chunks;
  },

  WhileStatement(node, state) {
    return [
    c('while ('),
    ...handle(node.test, state),
    c(') '),
    ...handle(node.body, state)];

  },

  DoWhileStatement(node, state) {
    return [
    c('do '),
    ...handle(node.body, state),
    c(' while ('),
    ...handle(node.test, state),
    c(');')];

  },

  ForStatement: scoped((node, state) => {
    const chunks = [c('for (')];

    if (node.init) {
      if (node.init.type === 'VariableDeclaration') {
        chunks.push(...handle_var_declaration(node.init, state));
      } else {
        chunks.push(...handle(node.init, state));
      }
    }

    chunks.push(c('; '));
    if (node.test) chunks.push(...handle(node.test, state));
    chunks.push(c('; '));
    if (node.update) chunks.push(...handle(node.update, state));

    chunks.push(
    c(') '),
    ...handle(node.body, state));


    return chunks;
  }),

  ForInStatement: scoped((node, state) => {
    const chunks = [
    c(`for ${node.await ? 'await ' : ''}(`)];


    if (node.left.type === 'VariableDeclaration') {
      chunks.push(...handle_var_declaration(node.left, state));
    } else {
      chunks.push(...handle(node.left, state));
    }

    chunks.push(
    c(node.type === 'ForInStatement' ? ` in ` : ` of `),
    ...handle(node.right, state),
    c(') '),
    ...handle(node.body, state));


    return chunks;
  }),

  DebuggerStatement(node, state) {
    return [c('debugger', node), c(';')];
  },

  FunctionDeclaration: scoped((node, state) => {
    const chunks = [];

    if (node.async) chunks.push(c('async '));
    chunks.push(c(node.generator ? 'function* ' : 'function '));
    if (node.id) chunks.push(...handle(node.id, state));
    chunks.push(c('('));

    const params = node.params.map(p => handle(p, {
      ...state,
      indent: state.indent + '\t' }));


    const multiple_lines =
    params.some(has_newline) ||
    params.map(get_length).reduce(sum, 0) + (state.indent.length + params.length - 1) * 2 > 80;


    const separator = c(multiple_lines ? `,\n${state.indent}` : ', ');

    if (multiple_lines) {
      chunks.push(
      c(`\n${state.indent}\t`),
      ...join(params, separator),
      c(`\n${state.indent}`));

    } else {
      chunks.push(
      ...join(params, separator));

    }

    chunks.push(
    c(') '),
    ...handle(node.body, state));


    return chunks;
  }),

  VariableDeclaration(node, state) {
    return handle_var_declaration(node, state).concat(c(';'));
  },

  VariableDeclarator(node, state) {
    if (node.init) {
      return [
      ...handle(node.id, state),
      c(' = '),
      ...handle(node.init, state)];

    } else {
      return handle(node.id, state);
    }
  },

  ClassDeclaration(node, state) {
    const chunks = [c('class ')];

    if (node.id) chunks.push(...handle(node.id, state), c(' '));

    if (node.superClass) {
      chunks.push(
      c('extends '),
      ...handle(node.superClass, state),
      c(' '));

    }

    chunks.push(...handle(node.body, state));

    return chunks;
  },

  ImportDeclaration(node, state) {
    const chunks = [c('import ')];

    const { length } = node.specifiers;
    const source = handle(node.source, state);

    if (length > 0) {
      let i = 0;

      while (i < length) {
        if (i > 0) {
          chunks.push(c(', '));
        }

        const specifier = node.specifiers[i];

        if (specifier.type === 'ImportDefaultSpecifier') {
          chunks.push(c(specifier.local.name, specifier));
          i += 1;
        } else if (specifier.type === 'ImportNamespaceSpecifier') {
          chunks.push(c('* as ' + specifier.local.name, specifier));
          i += 1;
        } else {
          break;
        }
      }

      if (i < length) {
        // we have named specifiers
        const specifiers = node.specifiers.slice(i).map(specifier => {
          const name = handle(specifier.imported, state)[0];
          const as = handle(specifier.local, state)[0];

          if (name.content === as.content) {
            return [as];
          }

          return [name, c(' as '), as];
        });

        const width = get_length(chunks) + specifiers.map(get_length).reduce(sum, 0) + 2 * specifiers.length + 6 + get_length(source);

        if (width > 80) {
          chunks.push(
          c(`{\n\t`),
          ...join(specifiers, c(',\n\t')),
          c('\n}'));

        } else {
          chunks.push(
          c(`{ `),
          ...join(specifiers, c(', ')),
          c(' }'));

        }
      }

      chunks.push(c(' from '));
    }

    chunks.push(
    ...source,
    c(';'));


    return chunks;
  },

  ImportExpression(node, state) {
    return [c('import('), ...handle(node.source, state), c(')')];
  },

  ExportDefaultDeclaration(node, state) {
    const chunks = [
    c(`export default `),
    ...handle(node.declaration, state)];


    if (node.declaration.type !== 'FunctionDeclaration') {
      chunks.push(c(';'));
    }

    return chunks;
  },

  ExportNamedDeclaration(node, state) {
    const chunks = [c('export ')];

    if (node.declaration) {
      chunks.push(...handle(node.declaration, state));
    } else {
      const specifiers = node.specifiers.map(specifier => {
        const name = handle(specifier.local, state)[0];
        const as = handle(specifier.exported, state)[0];

        if (name.content === as.content) {
          return [name];
        }

        return [name, c(' as '), as];
      });

      const width = 7 + specifiers.map(get_length).reduce(sum, 0) + 2 * specifiers.length;

      if (width > 80) {
        chunks.push(
        c('{\n\t'),
        ...join(specifiers, c(',\n\t')),
        c('\n}'));

      } else {
        chunks.push(
        c('{ '),
        ...join(specifiers, c(', ')),
        c(' }'));

      }

      if (node.source) {
        chunks.push(
        c(' from '),
        ...handle(node.source, state));

      }
    }

    chunks.push(c(';'));

    return chunks;
  },

  ExportAllDeclaration(node, state) {
    return [
    c(`export * from `),
    ...handle(node.source, state),
    c(`;`)];

  },

  MethodDefinition(node, state) {
    const chunks = [];

    if (node.static) {
      chunks.push(c('static '));
    }

    if (node.kind === 'get' || node.kind === 'set') {
      // Getter or setter
      chunks.push(c(node.kind + ' '));
    }

    if (node.value.async) {
      chunks.push(c('async '));
    }

    if (node.value.generator) {
      chunks.push(c('*'));
    }

    if (node.computed) {
      chunks.push(
      c('['),
      ...handle(node.key, state),
      c(']'));

    } else {
      chunks.push(...handle(node.key, state));
    }

    chunks.push(c('('));

    const { params } = node.value;
    for (let i = 0; i < params.length; i += 1) {
      chunks.push(...handle(params[i], state));
      if (i < params.length - 1) chunks.push(c(', '));
    }

    chunks.push(
    c(') '),
    ...handle(node.value.body, state));


    return chunks;
  },

  ArrowFunctionExpression: scoped((node, state) => {
    const chunks = [];

    if (node.async) chunks.push(c('async '));

    if (node.params.length === 1 && node.params[0].type === 'Identifier') {
      chunks.push(...handle(node.params[0], state));
    } else {
      const params = node.params.map(param => handle(param, {
        ...state,
        indent: state.indent + '\t' }));


      chunks.push(
      c('('),
      ...join(params, c(', ')),
      c(')'));

    }

    chunks.push(c(' => '));

    if (node.body.type === 'ObjectExpression') {
      chunks.push(
      c('('),
      ...handle(node.body, state),
      c(')'));

    } else {
      chunks.push(...handle(node.body, state));
    }

    return chunks;
  }),

  ThisExpression(node, state) {
    return [c('this', node)];
  },

  Super(node, state) {
    return [c('super', node)];
  },

  RestElement(node, state) {
    return [c('...'), ...handle(node.argument, state)];
  },

  YieldExpression(node, state) {
    if (node.argument) {
      return [c(node.delegate ? `yield* ` : `yield `), ...handle(node.argument, state)];
    }

    return [c(node.delegate ? `yield*` : `yield`)];
  },

  AwaitExpression(node, state) {
    if (node.argument) {
      const precedence = EXPRESSIONS_PRECEDENCE[node.argument.type];

      if (precedence && precedence < EXPRESSIONS_PRECEDENCE.AwaitExpression) {
        return [c('await ('), ...handle(node.argument, state), c(')')];
      } else {
        return [c('await '), ...handle(node.argument, state)];
      }
    }

    return [c('await')];
  },

  TemplateLiteral(node, state) {
    const chunks = [c('`')];

    const { quasis, expressions } = node;

    for (let i = 0; i < expressions.length; i++) {
      chunks.push(
      c(quasis[i].value.raw),
      c('${'),
      ...handle(expressions[i], state),
      c('}'));

    }

    chunks.push(
    c(quasis[quasis.length - 1].value.raw),
    c('`'));


    return chunks;
  },

  TaggedTemplateExpression(node, state) {
    return handle(node.tag, state).concat(handle(node.quasi, state));
  },

  ArrayExpression(node, state) {
    const chunks = [c('[')];

    const elements = [];
    let sparse_commas = [];

    for (let i = 0; i < node.elements.length; i += 1) {
      // can't use map/forEach because of sparse arrays
      const element = node.elements[i];
      if (element) {
        elements.push([...sparse_commas, ...handle(element, {
          ...state,
          indent: state.indent + '\t' })]);

        sparse_commas = [];
      } else {
        sparse_commas.push(c(','));
      }
    }

    const multiple_lines =
    elements.some(has_newline) ||
    elements.map(get_length).reduce(sum, 0) + (state.indent.length + elements.length - 1) * 2 > 80;


    if (multiple_lines) {
      chunks.push(
      c(`\n${state.indent}\t`),
      ...join(elements, c(`,\n${state.indent}\t`)),
      c(`\n${state.indent}`),
      ...sparse_commas);

    } else {
      chunks.push(...join(elements, c(', ')), ...sparse_commas);
    }

    chunks.push(c(']'));

    return chunks;
  },

  ObjectExpression(node, state) {
    if (node.properties.length === 0) {
      return [c('{}')];
    }

    let has_inline_comment = false;

    const chunks = [];
    const separator = c(', ');

    node.properties.forEach((p, i) => {
      chunks.push(...handle(p, {
        ...state,
        indent: state.indent + '\t' }));


      if (state.comments.length) {
        // TODO generalise this, so it works with ArrayExpressions and other things.
        // At present, stuff will just get appended to the closest statement/declaration
        chunks.push(c(', '));

        while (state.comments.length) {
          const comment = state.comments.shift();

          chunks.push(c(comment.type === 'Block' ?
          `/*${comment.value}*/\n${state.indent}\t` :
          `//${comment.value}\n${state.indent}\t`));

          if (comment.type === 'Line') {
            has_inline_comment = true;
          }
        }
      } else {
        if (i < node.properties.length - 1) {
          chunks.push(separator);
        }
      }
    });

    const multiple_lines =
    has_inline_comment ||
    has_newline(chunks) ||
    get_length(chunks) > 40;


    if (multiple_lines) {
      separator.content = `,\n${state.indent}\t`;
    }

    return [
    c(multiple_lines ? `{\n${state.indent}\t` : `{ `),
    ...chunks,
    c(multiple_lines ? `\n${state.indent}}` : ` }`)];

  },

  Property(node, state) {
    const value = handle(node.value, state);

    if (node.key === node.value) {
      return value;
    }

    // special case
    if (
    !node.computed &&
    node.value.type === 'AssignmentPattern' &&
    node.value.left.type === 'Identifier' &&
    node.value.left.name === node.key.name)
    {
      return value;
    }

    if (node.value.type === 'Identifier' && (
    node.key.type === 'Identifier' && node.key.name === value[0].content ||
    node.key.type === 'Literal' && node.key.value === value[0].content))
    {
      return value;
    }

    const key = handle(node.key, state);

    if (node.value.type === 'FunctionExpression' && !node.value.id) {
      state = {
        ...state,
        scope: state.scope_map.get(node.value) };


      const chunks = node.kind !== 'init' ?
      [c(`${node.kind} `)] :
      [];

      if (node.value.async) {
        chunks.push(c('async '));
      }
      if (node.value.generator) {
        chunks.push(c('*'));
      }

      chunks.push(
      ...(node.computed ? [c('['), ...key, c(']')] : key),
      c('('),
      ...join(node.value.params.map(param => handle(param, state)), c(', ')),
      c(') '),
      ...handle(node.value.body, state));


      return chunks;
    }

    if (node.computed) {
      return [
      c('['),
      ...key,
      c(']: '),
      ...value];

    }

    return [
    ...key,
    c(': '),
    ...value];

  },

  ObjectPattern(node, state) {
    const chunks = [c('{ ')];

    for (let i = 0; i < node.properties.length; i += 1) {
      chunks.push(...handle(node.properties[i], state));
      if (i < node.properties.length - 1) chunks.push(c(', '));
    }

    chunks.push(c(' }'));

    return chunks;
  },

  SequenceExpression(node, state) {
    const expressions = node.expressions.map(e => handle(e, state));

    return [
    c('('),
    ...join(expressions, c(', ')),
    c(')')];

  },

  UnaryExpression(node, state) {
    const chunks = [c(node.operator)];

    if (node.operator.length > 1) {
      chunks.push(c(' '));
    }

    if (
    EXPRESSIONS_PRECEDENCE[node.argument.type] <
    EXPRESSIONS_PRECEDENCE.UnaryExpression)
    {
      chunks.push(
      c('('),
      ...handle(node.argument, state),
      c(')'));

    } else {
      chunks.push(...handle(node.argument, state));
    }

    return chunks;
  },

  UpdateExpression(node, state) {
    return node.prefix ?
    [c(node.operator), ...handle(node.argument, state)] :
    [...handle(node.argument, state), c(node.operator)];
  },

  AssignmentExpression(node, state) {
    return [
    ...handle(node.left, state),
    c(` ${node.operator || '='} `),
    ...handle(node.right, state)];

  },

  BinaryExpression(node, state) {
    const chunks = [];

    // TODO
    // const is_in = node.operator === 'in';
    // if (is_in) {
    // 	// Avoids confusion in `for` loops initializers
    // 	chunks.push(c('('));
    // }

    if (needs_parens(node.left, node, false)) {
      chunks.push(
      c('('),
      ...handle(node.left, state),
      c(')'));

    } else {
      chunks.push(...handle(node.left, state));
    }

    chunks.push(c(` ${node.operator} `));

    if (needs_parens(node.right, node, true)) {
      chunks.push(
      c('('),
      ...handle(node.right, state),
      c(')'));

    } else {
      chunks.push(...handle(node.right, state));
    }

    return chunks;
  },

  ConditionalExpression(node, state) {
    const chunks = [];

    if (
    EXPRESSIONS_PRECEDENCE[node.test.type] >
    EXPRESSIONS_PRECEDENCE.ConditionalExpression)
    {
      chunks.push(...handle(node.test, state));
    } else {
      chunks.push(
      c('('),
      ...handle(node.test, state),
      c(')'));

    }

    const child_state = { ...state, indent: state.indent + '\t' };

    const consequent = handle(node.consequent, child_state);
    const alternate = handle(node.alternate, child_state);

    const multiple_lines =
    has_newline(consequent) || has_newline(alternate) ||
    get_length(chunks) + get_length(consequent) + get_length(alternate) > 50;


    if (multiple_lines) {
      chunks.push(
      c(`\n${state.indent}? `),
      ...consequent,
      c(`\n${state.indent}: `),
      ...alternate);

    } else {
      chunks.push(
      c(` ? `),
      ...consequent,
      c(` : `),
      ...alternate);

    }

    return chunks;
  },

  NewExpression(node, state) {
    const chunks = [c('new ')];

    if (
    EXPRESSIONS_PRECEDENCE[node.callee.type] <
    EXPRESSIONS_PRECEDENCE.CallExpression || has_call_expression(node.callee))
    {
      chunks.push(
      c('('),
      ...handle(node.callee, state),
      c(')'));

    } else {
      chunks.push(...handle(node.callee, state));
    }

    // TODO this is copied from CallExpression — DRY it out
    const args = node.arguments.map(arg => handle(arg, {
      ...state,
      indent: state.indent + '\t' }));


    const separator = args.some(has_newline) // TODO or length exceeds 80
    ? c(',\n' + state.indent) :
    c(', ');

    chunks.push(
    c('('),
    ...join(args, separator),
    c(')'));


    return chunks;
  },

  ChainExpression(node, state) {
    return handle(node.expression, state);
  },

  CallExpression(node, state) {
    const chunks = [];

    if (
    EXPRESSIONS_PRECEDENCE[node.callee.type] <
    EXPRESSIONS_PRECEDENCE.CallExpression)
    {
      chunks.push(
      c('('),
      ...handle(node.callee, state),
      c(')'));

    } else {
      chunks.push(...handle(node.callee, state));
    }

    if (node.optional) {
      chunks.push(c('?.'));
    }

    const args = node.arguments.map(arg => handle(arg, state));

    const multiple_lines = args.slice(0, -1).some(has_newline); // TODO or length exceeds 80

    if (multiple_lines) {
      // need to handle args again. TODO find alternative approach?
      const args = node.arguments.map(arg => handle(arg, {
        ...state,
        indent: `${state.indent}\t` }));


      chunks.push(
      c(`(\n${state.indent}\t`),
      ...join(args, c(`,\n${state.indent}\t`)),
      c(`\n${state.indent})`));

    } else {
      chunks.push(
      c('('),
      ...join(args, c(', ')),
      c(')'));

    }

    return chunks;
  },

  MemberExpression(node, state) {
    const chunks = [];

    if (EXPRESSIONS_PRECEDENCE[node.object.type] < EXPRESSIONS_PRECEDENCE.MemberExpression) {
      chunks.push(
      c('('),
      ...handle(node.object, state),
      c(')'));

    } else {
      chunks.push(...handle(node.object, state));
    }

    if (node.computed) {
      if (node.optional) {
        chunks.push(c('?.'));
      }
      chunks.push(
      c('['),
      ...handle(node.property, state),
      c(']'));

    } else {
      chunks.push(
      c(node.optional ? '?.' : '.'),
      ...handle(node.property, state));

    }

    return chunks;
  },

  MetaProperty(node, state) {
    return [...handle(node.meta, state), c('.'), ...handle(node.property, state)];
  },

  Identifier(node, state) {
    let name = node.name;

    if (name[0] === '@') {
      name = state.getName(name.slice(1));
    }
    else if(typeof state.scope == "undefined") {
      name = node.name
    }
    else if (node.name[0] === '#') {
      const owner = state.scope.find_owner(node.name);
      if (!owner) {
        throw new Error(`Could not find owner for node`);
      }

      if (!state.deconflicted.has(owner)) {
        state.deconflicted.set(owner, new Map());
      }

      const deconflict_map = state.deconflicted.get(owner);

      if (!deconflict_map.has(node.name)) {
        deconflict_map.set(node.name, deconflict(node.name.slice(1), owner.references));
      }

      name = deconflict_map.get(node.name);
    }

    return [c(name, node)];
  },

  Literal(node, state) {
    if (typeof node.value === 'string') {
      return [
      // TODO do we need to handle weird unicode characters somehow?
      // str.replace(/\\u(\d{4})/g, (m, n) => String.fromCharCode(+n))
      c(JSON.stringify(node.value).replace(re, (_m, _i, at, hash, name) => {
        if (at) return '@' + name;
        if (hash) return '#' + name;
        throw new Error(`this shouldn't happen`);
      }), node)];

    }

    const { regex } = node; // TODO is this right?
    if (regex) {
      return [c(`/${regex.pattern}/${regex.flags}`, node)];
    }

    return [c(String(node.value), node)];
  } };


handlers.ForOfStatement = handlers.ForInStatement;
handlers.FunctionExpression = handlers.FunctionDeclaration;
handlers.ClassExpression = handlers.ClassDeclaration;
handlers.ClassBody = handlers.BlockStatement;
handlers.SpreadElement = handlers.RestElement;
handlers.ArrayPattern = handlers.ArrayExpression;
handlers.LogicalExpression = handlers.BinaryExpression;
handlers.AssignmentPattern = handlers.AssignmentExpression;

let btoa = () => {
  throw new Error('Unsupported environment: `window.btoa` or `Buffer` should be supported.');
};
if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
  btoa = str => window.btoa(unescape(encodeURIComponent(str)));
} else if (typeof Buffer === 'function') {
  btoa = str => Buffer.from(str, 'utf-8').toString('base64');
}








function print(node, opts = {}) {
  if (Array.isArray(node)) {
    return print({
      type: 'Program',
      body: node },
    opts);
  }

  const {
    getName = x => {
      throw new Error(`Unhandled sigil @${x}`);
    } } =
  opts;

  let { map: scope_map, scope } = analyze(node);
  const deconflicted = new WeakMap();

  const chunks = handle(node, {
    indent: '',
    getName,
    scope,
    scope_map,
    deconflicted,
    comments: [] });




  let code = '';
  let mappings = [];
  let current_line = [];
  let current_column = 0;

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];

    code += chunk.content;

    if (chunk.loc) {
      current_line.push([
      current_column,
      0, // source index is always zero
      chunk.loc.start.line - 1,
      chunk.loc.start.column]);

    }

    for (let i = 0; i < chunk.content.length; i += 1) {
      if (chunk.content[i] === '\n') {
        mappings.push(current_line);
        current_line = [];
        current_column = 0;
      } else {
        current_column += 1;
      }
    }

    if (chunk.loc) {
      current_line.push([
      current_column,
      0, // source index is always zero
      chunk.loc.end.line - 1,
      chunk.loc.end.column]);

    }
  }

  mappings.push(current_line);

  const map = {
    version: 3,
    names: [],
    sources: [opts.sourceMapSource || null],
    sourcesContent: [opts.sourceMapContent || null],
    mappings: encode(mappings) };


  Object.defineProperties(map, {
    toString: {
      enumerable: false,
      value: function toString() {
        return JSON.stringify(this);
      } },

    toUrl: {
      enumerable: false,
      value: function toUrl() {
        return 'data:application/json;charset=utf-8;base64,' + btoa(this.toString());
      } } });



  return {
    code,
    map };

}

const sigils = {
  '@': 'AT',
  '#': 'HASH' };


const join$1 = strings => {
  let str = strings[0];
  for (let i = 1; i < strings.length; i += 1) {
    str += `_${id}_${i - 1}_${strings[i]}`;
  }
  return str.replace(/([@#])(\w+)/g, (_m, sigil, name) => `_${id}_${sigils[sigil]}_${name}`);
};

const flatten_body = (array, target) => {
  for (let i = 0; i < array.length; i += 1) {
    const statement = array[i];
    if (Array.isArray(statement)) {
      flatten_body(statement, target);
      continue;
    }

    if (statement.type === 'ExpressionStatement') {
      if (statement.expression === EMPTY) continue;

      if (Array.isArray(statement.expression)) {
        // TODO this is hacktacular
        let node = statement.expression[0];
        while (Array.isArray(node)) node = node[0];
        if (node) node.leadingComments = statement.leadingComments;

        flatten_body(statement.expression, target);
        continue;
      }

      if (/(Expression|Literal)$/.test(statement.expression.type)) {
        target.push(statement);
        continue;
      }

      if (statement.leadingComments) statement.expression.leadingComments = statement.leadingComments;
      if (statement.trailingComments) statement.expression.trailingComments = statement.trailingComments;

      target.push(statement.expression);
      continue;
    }

    target.push(statement);
  }

  return target;
};

const flatten_properties = (array, target) => {
  for (let i = 0; i < array.length; i += 1) {
    const property = array[i];

    if (property.value === EMPTY) continue;

    if (property.key === property.value && Array.isArray(property.key)) {
      flatten_properties(property.key, target);
      continue;
    }

    target.push(property);
  }

  return target;
};

const flatten = (nodes, target) => {
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];

    if (node === EMPTY) continue;

    if (Array.isArray(node)) {
      flatten(node, target);
      continue;
    }

    target.push(node);
  }

  return target;
};

const EMPTY = { type: 'Empty' };

const acorn_opts = (comments, raw) => {
  const { onComment } = get_comment_handlers(comments, raw);
  return {
    ecmaVersion: 2020,
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    onComment };

};

const inject = (raw, node, values, comments) => {
  comments.forEach(comment => {
    comment.value = comment.value.replace(re, (m, i) => +i in values ? values[+i] : m);
  });

  const { enter, leave } = get_comment_handlers(comments, raw);

  walk(node, {
    enter,

    leave(node, parent, key, index) {
      if (node.type === 'Identifier') {
        re.lastIndex = 0;
        const match = re.exec(node.name);

        if (match) {
          if (match[1]) {
            if (+match[1] in values) {
              let value = values[+match[1]];

              if (typeof value === 'string') {
                value = { type: 'Identifier', name: value, leadingComments: node.leadingComments, trailingComments: node.trailingComments };
              } else if (typeof value === 'number') {
                value = { type: 'Literal', value, leadingComments: node.leadingComments, trailingComments: node.trailingComments };
              }

              this.replace(value || EMPTY);
            }
          } else {
            node.name = `${match[2] ? `@` : `#`}${match[4]}`;
          }
        }
      }

      if (node.type === 'Literal') {
        if (typeof node.value === 'string') {
          re.lastIndex = 0;
          node.value = node.value.replace(re, (m, i) => +i in values ? values[+i] : m);
        }
      }

      if (node.type === 'TemplateElement') {
        re.lastIndex = 0;
        node.value.raw = node.value.raw.replace(re, (m, i) => +i in values ? values[+i] : m);
      }

      if (node.type === 'Program' || node.type === 'BlockStatement') {
        node.body = flatten_body(node.body, []);
      }

      if (node.type === 'ObjectExpression' || node.type === 'ObjectPattern') {
        node.properties = flatten_properties(node.properties, []);
      }

      if (node.type === 'ArrayExpression' || node.type === 'ArrayPattern') {
        node.elements = flatten(node.elements, []);
      }

      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
        node.params = flatten(node.params, []);
      }

      if (node.type === 'CallExpression' || node.type === 'NewExpression') {
        node.arguments = flatten(node.arguments, []);
      }

      if (node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration') {
        node.specifiers = flatten(node.specifiers, []);
      }

      if (node.type === 'ForStatement') {
        node.init = node.init === EMPTY ? null : node.init;
        node.test = node.test === EMPTY ? null : node.test;
        node.update = node.update === EMPTY ? null : node.update;
      }

      leave(node);
    } });

};

function b(strings, ...values) {
  const str = join$1(strings);
  const comments = [];

  try {
    const ast = parse$1(str, acorn_opts(comments, str));

    inject(str, ast, values, comments);

    return ast.body;
  } catch (err) {
    handle_error(str, err);
  }
}

function x(strings, ...values) {
  const str = join$1(strings);
  const comments = [];

  try {
    const expression = parseExpressionAt$1(str, 0, acorn_opts(comments, str));
    const match = /\S+/.exec(str.slice(expression.end));
    if (match) {
      throw new Error(`Unexpected token '${match[0]}'`);
    }

    inject(str, expression, values, comments);

    return expression;
  } catch (err) {
    handle_error(str, err);
  }
}

function p(strings, ...values) {
  const str = `{${join$1(strings)}}`;
  const comments = [];

  try {
    const expression = parseExpressionAt$1(str, 0, acorn_opts(comments, str));

    inject(str, expression, values, comments);

    return expression.properties[0];
  } catch (err) {
    handle_error(str, err);
  }
}

function handle_error(str, err) {
  // TODO location/code frame

  re.lastIndex = 0;

  str = str.replace(re, (m, i, at, hash, name) => {
    if (at) return `@${name}`;
    if (hash) return `#${name}`;

    return '${...}';
  });

  console.log(`failed to parse:\n${str}`);
  throw err;
}

const parse = (source, opts) => {
  const comments = [];
  const { onComment, enter, leave } = get_comment_handlers(comments, source);
  const ast = parse$1(source, { onComment, ...opts });
  walk(ast, { enter, leave });
  return ast;
};

const parseExpressionAt = (source, index, opts) => {
  const comments = [];
  const { onComment, enter, leave } = get_comment_handlers(comments, source);
  const ast = parseExpressionAt$1(source, index, { onComment, ...opts });
  walk(ast, { enter, leave });
  return ast;
};

export { b, p, parse, parseExpressionAt, print, x };
