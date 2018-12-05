// Last expression can go without semicolon 
// only where the value is used. 
define method empty? (vector :: <vector>)
  vector.size = 0
end method empty?;

define method add (vector :: <vector>, object)
  let new-vector :: <vector>
    = make(vector.class-for-copy, size: vector.size + 1);
  replace-subsequence!(new-vector, vector);
  new-vector[vector.size] := object;
  new-vector
end method add;