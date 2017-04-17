import { ASTLeaf } from "BaldnessJs/_interfaces";
/**
 * Main function wich parses the source with a TPL or the ASTLeaf associated (and precompiled with compile method)
 * The result will be a "jsonisable" js object
 * @function parse
 * @public
 * @param {string} source : the text source
 * @param {string | ASTLeaf} tpl : the template source (or the compiled ASTLeaf)
 */
export declare function parse(source: string, tpl: string | ASTLeaf): any;
/**
 * If you have just parsed a source, you can get the ASTLeaf compiled from the tpl for debug purpose
 * @function getLastAST
 * @public
 * @return {ASTLeaf} the compiled Abstract Syntax Tree of the template
 */
export declare function getLastAST(): ASTLeaf;
