import { debugOn } from "./_debug"
import { compile, _findSections, regenerateTpl } from "./_compile_AST"
import { parse, getLastAST } from "./_parsing"
import { ASTLeaf } from "./_interfaces"

interface Baldness {
  parse         : (source :string, tpl :string | ASTLeaf) => any,
  getLastAST    : () => ASTLeaf,
  compile       : (tpl :string) => ASTLeaf,
  regenerateTpl : (leaf :ASTLeaf) => string,
  debugOn       : (prConsole? :Console) => void,
  _findSections : (src) => ASTLeaf[]
}

let Baldness: Baldness = {
  parse         : parse,
  getLastAST    : getLastAST,
  compile       : compile,
  regenerateTpl : regenerateTpl,
  debugOn       : debugOn,
  _findSections : _findSections
}
export default Baldness
