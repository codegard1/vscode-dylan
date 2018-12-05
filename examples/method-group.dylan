//// Match protocol.
define generic match
  (pattern, fragment, more-patterns, more-fragments, env, fail) => ();

define generic match-empty
  (pattern, more-patterns, env, fail) => ();

define generic folds-separator?
  (pattern) => ();

// Good (consistent prefix)
define class <http-request> (<request>)
  slot request-headers, init-keyword: headers:;
  ...
end;