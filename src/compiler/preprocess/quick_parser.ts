import { whitespace } from '../utils/patterns';

export interface Position {
  offset: number;
  length: number;
  source: string;
  attributes: Record<string, string|boolean> | null;
  raw_attributes: string;
}

const matching_bracket = {
  ']': '[',
  '}': '{',
  ')': '('
};

// simplified svelte parser
export default function parse(template: string) {
  const scripts: Position[] = [];
  const styles: Position[] = [];
  const expressions: Position[] = [];

  let index = 0;
  while (index < template.length) {
    if (match('<')) {
      parse_tag();
    } else if (match('{')) {
      parse_mustache();
    } else {
      parse_text();
    }
  }

  function add_script_expression(get_expression: () => string) {
    const offset = index;
    const source = get_expression();
    expressions.push({ offset, length: source.length, source, attributes: null, raw_attributes: null });
  }

  function parse_tag() {
    const tag_start = index;
    index++;
    if (eat('!--')) {
      read_until_regex(/-->/);
      eat('-->');
    } else if (eat('/')) {
      // closing tag
      read_until('>');
      index++;
    } else {
      const tag_name = read_until_regex(/(\s|\/|>)/);
      if (tag_name === 'script') {
        const raw_attributes = read_until_regex(/\/?>/);
        const attributes = parse_tag_attributes(raw_attributes);
        let source: string;
        if (eat('/>')) {
          source = '';
        } else {
          eat('>');
          source = read_until_regex(/<\/script\s*>/);
          eat_regex(/<\/script\s*>/);
        }
        const length = index - tag_start;
        scripts.push({ offset: tag_start, length, source, attributes, raw_attributes });
      } else if (tag_name === 'style') {
        const raw_attributes = read_until_regex(/\/?>/);
        const attributes = parse_tag_attributes(raw_attributes);
        let source: string;
        if (eat('/>')) {
          source = '';
        } else {
          eat('>');
          source = read_until_regex(/<\/style\s*>/);
          eat_regex(/<\/style\s*>/);
        }
        const length = index - tag_start;
        styles.push({ offset: tag_start, length, source, attributes, raw_attributes });
      } else {
        while (index < template.length) {
          allow_whitespace();
          if (eat('{')) {
            // handle spread
            eat_regex(/\s+\.\.\./);
            add_script_expression(() => read_expression_until('}'));
            index++;
            continue;
          }
          // attribute name
          if (!read_until_regex(/[\s=/>"']/)) {
            break;
          }
          allow_whitespace();
          if (eat('=')) {
            // attribute value
            allow_whitespace();
            const quote_mark = eat("'") ? "'" : eat('"') ? '"' : null;
            if (quote_mark && eat(quote_mark)) {
              continue;
            }
            const ending_regex =
              quote_mark === "'"
                ? /'/
                : quote_mark === '"' ? /"/ : /(\/>|[\s"'=<>`])/;
            while (index < template.length) {
              if (match_regex(ending_regex)) {
                break;
              } else if (eat('{')) {
                add_script_expression(() => read_expression_until('}'));
                index++;
              } else {
                index++;
              }
            }
            if (quote_mark) index++;
          }
        }
      }
    }
  }

  function parse_tag_attributes(str: string) {
    const attributes = {};
    let i = 0;
    while (i < str.length) {
      const char = str[i++];
      if (/\s/.test(char)) continue;
      let name = char;
      while (i < str.length && !/[\s=/>"']/.test(str[i])) {
        name += str[i++];
      }
      if (str[i] === '=') {
        i++;
        const quote_mark = str[i];
        const regex = (
          quote_mark === "'" ? /'/ :
            quote_mark === '"' ? /"/ :
              /(\/>|[\s"'=<>`])/
        );
        if (quote_mark === "'" || quote_mark === '"') {
          i++;
        }
        const match = str.slice(i).match(regex);
        let value;
        if (match) {
          value = str.slice(i, i + match.index);
          i += match.index + 1;
        } else {
          value = str.slice(i + 1);
          i = str.length;
        }
        attributes[name] = value;
      } else {
        attributes[name] = true;
      }
    }
  
    return attributes;
  }

  function parse_mustache() {
    index++;
    // {/if}, {/each}, {/await} or {/key}
    if (eat('/')) {
      read_until('}');
      index++;
    } else if (eat(':else')) {
      allow_whitespace();
      if (eat('if')) {
        allow_whitespace();
        add_script_expression(() => read_expression_until('}'));
      }
      allow_whitespace();
      eat('}');
    } else if (match(':then') || match(':catch')) {
      eat(':then') || eat('catch');
      if (!eat('}')) {
        allow_whitespace();
        read_expression_until('}');
        eat('}');
      }
    } else if (eat('#')) {
      if (eat('if') || eat('key')) {
        allow_whitespace();
        add_script_expression(() => read_expression_until('}'));
        index++;
      } else if (eat('each')) {
        allow_whitespace();
        add_script_expression(() => read_expression_until(/\sas/));
        eat_regex(/\sas/);
        allow_whitespace();
        read_expression_until('}');
        index++;
      } else if (eat('await')) {
        allow_whitespace();
        add_script_expression(() => read_expression_until(/\sthen|\scatch|\}/));
        if (eat_regex(/\sthen/) || eat_regex(/\scatch/)) {
          read_expression_until('}');
        }
        index++;
      } else {
        read_until('}');
        index++;
      }
    } else if (eat('@html')) {
      allow_whitespace();
      add_script_expression(() => read_expression_until('}'));
      index++;
    } else if (eat('@debug')) {
      allow_whitespace();
      add_script_expression(() => read_expression_until('}'));
      index++;
    } else {
      add_script_expression(() => read_expression_until('}'));
      index++;
    }
  }

  function parse_text() {
    while (index < template.length && !match('<') && !match('{')) {
      index++;
    }
  }

  function match(str: string) {
    return template.slice(index, index + str.length) === str;
  }
  function match_regex(pattern: RegExp) {
    const match = pattern.exec(template.slice(index));
    if (!match || match.index !== 0) return null;
    return match[0];
  }
  function eat(str: string) {
    if (match(str)) {
      index += str.length;
      return true;
    }
    return false;
  }
  function eat_regex(pattern: RegExp) {
    const result = match_regex(pattern);
    if (result) index += result.length;
    return result;
  }
  function allow_whitespace() {
    while (index < template.length && whitespace.test(template[index])) {
      index++;
    }
  }
  function read_until(str: string) {
    const start = index;
    const next_index = template.slice(start).indexOf(str);
    if (next_index > -1) {
      index += next_index;
      return template.slice(start, index);
    }
    index = template.length;
    return template.slice(start);
  }
  function read_until_regex(pattern: RegExp) {
    const start = index;
    const match = pattern.exec(template.slice(index));
    if (match) {
      index += match.index;
      return template.slice(start, index);
    }
    index = template.length;
    return template.slice(start);
  }
  function read_expression_until(str: string | RegExp) {
    const bracket_stack = [];
    let quote = null;
    const start = index;

    const is_ending =
      typeof str === 'string' ? () => match(str) : () => match_regex(str);

    while (index < template.length) {
      if (bracket_stack.length === 0 && quote === null && is_ending()) {
        break;
      }
      const char = template[index];
      switch (char) {
        case "'":
        case '"':
        case '`': {
          if (quote === null) {
            quote = char;
          } else if (quote === char) {
            quote = null;
          }
          break;
        }
        case '[':
        case '{':
        case '(':
          if (quote === null) {
            bracket_stack.push(char);
          }
          break;
        case ']':
        case '}':
        case ')':
          if (quote === null) {
            const find = matching_bracket[char];
            // assume unclosed bracket
            while (bracket_stack.length) {
              if (bracket_stack.pop() === find) {
                break;
              }
            }
          }
      }

      index++;
    }

    return template.slice(start, index);
  }

  return { scripts, styles, expressions };
}
