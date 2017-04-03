import { nullConsole } from "console"
/**
 * Provide an interface for a leaf in the Abstract Syntax Tree (AST) of the given template
 * @interface ASTLeaf
 */
type ASTLeafType =  "section" | "mustacheVar" | "root" | "text";
interface ASTLeaf {
  label     ?: string,
  children  ?: any[],
  src       : string,
  type      /* : ASTLeafType*/, // string literal type does not seem to work here
  info      ?: Object,
  markup    ?: {
    begin : string,
    end   ?: string
  },
  position  ?: {
    raw ?: {
      begin   :number,
      length  :number
    },
    content : {
      begin   :number,
      length  :number
    }
  }
}

let _console :Console = nullConsole
export function debugOn(prConsole? :Console) {
  _console = prConsole ? prConsole : console;
}

export function parse(source :String, tpl :String) :Object {
  return "toto"
}

export function compile(tpl :string) {
  let root = {
    label     : "root",
    type      : "root",
    src       : tpl,
    children  : []
  }
  return _compileRecur(root)
}

function _compileRecur(leaf :ASTLeaf) :ASTLeaf {
  let sections = _findSections(leaf.src)
  let curPos = 0
  sections.forEach((section :ASTLeaf) => {
    _compileRecur(section)
    curPos = __insertChildrenInLeaf(leaf, curPos, section)
  })

  if (curPos < leaf.src.length - curPos) {
    // There is still text after the last section
    let text = leaf.src.substr(curPos)
    leaf.children.push({
      type : "text",
      src : leaf.src.substr(curPos),
      position : {
        content : {
          begin   : curPos,
          length  : text.length
        }
      }
    })
  }
  return leaf
}

function __insertChildrenInLeaf(leaf :ASTLeaf, pos :number, section :ASTLeaf) :number {
  // The section can be preceded by text
  let textChild :ASTLeaf
  let sectionRawPos = section.position.raw
  if (sectionRawPos.begin > pos) {
    let textLen = sectionRawPos.begin - pos
    textChild = {
      type : "text",
      src : leaf.src.substr(pos, textLen),
      position : {
        content : {
          begin   : pos,
          length  : textLen
        }
      }
    }
    leaf.children.push(textChild)
  }
  // Finally push the section as a child of leaf
  leaf.children.push(section)
  return sectionRawPos.begin + sectionRawPos.length
}

export function _findSections(src) :ASTLeaf[] {
  let partialASTLeaf :ASTLeaf
  let sectionLeaves :ASTLeaf[] = []
  let pos = 0
  while (partialASTLeaf = _findSectionBegin(src, pos)) {
    _console.log('  We find the begin of a section :', partialASTLeaf)
    try { _findSectionEnd(partialASTLeaf) } catch (e) { _console.error(e); return [] }
    sectionLeaves.push(partialASTLeaf)
    // Continue walking in the src in order to find more first-level sections
    pos = partialASTLeaf.position.raw.begin + partialASTLeaf.position.raw.length
    src = src.substr(pos)
  }

  return sectionLeaves
}

/**
 * Find the potential begin of the section and create a ASTLeaf
 * @function _findSectionBegin
 * @param {string} src : a part of the source text of the leaf
 * @param {number} pos : position in the global source text of the leaf
 * @return {ASTLeaf} created leaf
 */
function _findSectionBegin(src :string, pos :number) :ASTLeaf {
  _console.log("_findSectionBegin", src)
  let regExp = new RegExp("({{#([a-z_][a-z0-9_]+)}})", "i")
  let match = src.match(regExp)
  if (! match) return null // --> return

  _console.assert(match[0] !== undefined &&
                  match[1] !== undefined &&
                  match[2] !== undefined, 'match result not correct: ', match)
  _console.log("  match:", match)
  return {
    label :  match[2],
    type  : "section",
    src   : src.substr(match.index + match[1].length),
    markup : {
      begin : match[1],
      end   : null
    },
    info  : { repeatMode : "" },
    children : [],
    position : {
      raw : {
        begin : match.index + pos,
        length   : null // not known for the moment
      },
      content : {
        begin : match.index + match[1].length + pos,
        length   : null // not known for the moment
      }
    }
  }
}

/**
 * Find the end of the section and mutate section according to new infos
 * @function _findSectionEnd
 * @param {ASTLead} section
 */
function _findSectionEnd(section :ASTLeaf) :void {
  _console.log("_findSectionEnd", section)
  let regExp = new RegExp(`({{/${section.label}}})`, "i")
  let match = section.src.match(regExp)
  if (! match) throw `No end of section for section : ${section.label}` // --> exception

  _console.assert( match[0] !== undefined &&
                   match[1] !== undefined)

  // Mutate section
  let beginMarkupLength = section.markup.begin.length
  section.position.raw.length = match.index + match[1].length + beginMarkupLength
  let contentPos = section.position.content
  contentPos.length = match.index
  section.src = section.src.substr(0, match.index)
  section.markup.end = match[1]
}
