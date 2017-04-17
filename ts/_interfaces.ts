/**
 * Provide an interface for a leaf in the Abstract Syntax Tree (AST) of the given template
 * @interface ASTLeaf
 */
export type ASTLeafType = "section" | "mustacheVar" | "root" | "text" | "strSwallowing"
export type ASTSimpleLeafType = "mustacheVar" | "strSwallowing"
export interface ASTLeaf {
  label     ?: string,
  children  ?: any[],
  src       : string,
  type      /* : ASTLeafType*/, // string literal type does not seem to work here
  info      ?: {
    repeatMode  ?: string,
    regExp      ?: string
  },
  markup    ?: {
    begin : string,
    end   ?: string
  },
  position  ?: {
    raw : {
      begin   :number,
      length  :number
    },
    content ?: {
      begin   :number,
      length  :number
    }
  }
}


export interface MatchInfo {
    matchIdx  :number,
    ASTLeaf   :ASTLeaf
}

export interface RevParseFlat {
  ASTLeaf :ASTLeaf,
  occurencies : string[]
}
