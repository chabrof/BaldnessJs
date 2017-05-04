import { ASTLeaf } from "./_interfaces";
interface Baldness {
    parse: (source: string, tpl: string | ASTLeaf) => any;
    getLastAST: () => ASTLeaf;
    compile: (tpl: string) => ASTLeaf;
    regenerateTpl: (leaf: ASTLeaf) => string;
    debugOn: (prConsole?: Console) => void;
    _findSections: (src) => ASTLeaf[];
}
declare let Baldness: Baldness;
export default Baldness;
