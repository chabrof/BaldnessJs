import { ASTLeaf } from "BaldnessJs/_interfaces";
/**
 * Main function wich generates the ASTLeaf (Here is the root of the AST tree) from template string
 * The AST can be compiled once and used several times in order to parse text
 * @function compile
 * @public
 * @param {string} tpl : the template source (seems like a Mustache/Handlebars template)
 */
export declare function compile(tpl: string): ASTLeaf;
export declare function _findSections(src: any): ASTLeaf[];
/**
 * Regenerate the template with an AST
 * (usually for debug purpose)
 * @function regenerateTpl
 * @public
 * @param {ASTLeaf} root of the AST
 * @return {string} the TPL (which should be the same as the one used to compile AST)
 */
export declare function regenerateTpl(leaf: ASTLeaf): string;
