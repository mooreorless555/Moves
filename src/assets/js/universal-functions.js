/**************
 * Universal Functions for use in Moves
 *    Just handy things a coder might need
 * 
 * - Chris Moore
 */

function hasValue(obj, prop, value) {
  
  for (var key in obj) {
    var el = obj[key];
    if (el == value) {
      return true;
    }
  }
  
  return false;
}