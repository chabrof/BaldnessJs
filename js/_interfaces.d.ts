/**
 * Provide an interface for a leaf in the Abstract Syntax Tree (AST) of the given template
 * @interface ASTLeaf
 */
export declare type ASTLeafType = "section" | "mustacheVar" | "root" | "text" | "strSwallowing";
export declare type ASTSimpleLeafType = "mustacheVar" | "strSwallowing";
export interface ASTLeaf {
    label?: string;
    children?: any[];
    src: string;
    type: any;
    info?: Object;
    markup?: {
        begin: string;
        end?: string;
    };
    position?: {
        raw: {
            begin: number;
            length: number;
        };
        content?: {
            begin: number;
            length: number;
        };
    };
}
export interface MatchInfo {
    matchIdx: number;
    ASTLeaf: ASTLeaf;
}
