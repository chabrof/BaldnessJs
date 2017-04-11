import { debugOn } from "BaldnessJs/_debug"
import { compile, _findSections, regenerateTpl } from "BaldnessJs/_compile_AST"
import { parse, getLastAST } from "BaldnessJs/_parsing"
import { ASTLeaf } from "BaldnessJs/_interfaces"

interface Baldness {
  parse         : (source :string, tpl :string) => Object,
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
