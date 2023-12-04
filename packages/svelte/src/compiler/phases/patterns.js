export const regex_whitespace = /\s/;
export const regex_whitespaces = /\s+/;
export const regex_starts_with_newline = /^\r?\n/;
export const regex_starts_with_whitespace = /^\s/;
export const regex_starts_with_whitespaces = /^[ \t\r\n]*/;
export const regex_ends_with_whitespace = /\s$/;
export const regex_ends_with_whitespaces = /[ \t\r\n]*$/;
/** Not \S because that also removes explicit whitespace defined through things like `&nbsp;` */
export const regex_not_whitespace = /[^ \t\r\n]/;
/** Not \s+ because that also includes explicit whitespace defined through things like `&nbsp;` */
export const regex_whitespaces_strict = /[ \t\n\r\f]+/g;

export const regex_only_whitespaces = /^[ \t\n\r\f]+$/;

export const regex_not_newline_characters = /[^\n]/g;

export const regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

export const regex_special_chars = /[\d+`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;

export const regex_starts_with_vowel = /^[aeiou]/;
export const regex_heading_tags = /^h[1-6]$/;
export const regex_illegal_attribute_character = /(^[0-9-.])|[\^$@%&#?!|()[\]{}^*+~;]/;
