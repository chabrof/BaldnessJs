import { ASTLeaf, MatchInfo } from "BaldnessJs/_interfaces"
import { compile } from "BaldnessJs/_compile_AST"
import { _console } from "BaldnessJs/_debug"

let tplAST :ASTLeaf
export function parse(source :string, tpl :string | ASTLeaf) :Object {
  if (typeof tpl === 'string')
    tplAST = compile(tpl)
  else
    tplAST = tpl as ASTLeaf
  let obj = {}
  _console.log('')
  _console.log('')
  _console.log('Begin of parsing')
  _console.log('')
  return _parseRecur(source, tplAST, obj)
}

export function getLastAST() :ASTLeaf {
  return tplAST
}

function _parseRecur(source :string, tplAST :ASTLeaf, obj :any) :any {
  _console.group()
  _console.log(`parseRecur for leaf of type (${tplAST.type}) : `, tplAST.label)
  _console.assert(source !== undefined, 'source must be a string')

  let futureMatches :MatchInfo[] = []
  let regExpStr = __getRegExpPartByType[tplAST.type](tplAST, futureMatches)

  _console.log('regExp generated :', regExpStr)
  let regExp = new RegExp(regExpStr)
  let match = source.match(regExp)
  _console.log('matches', match)
  // Store values in obj
  futureMatches.forEach((futureMatch) => {
    let ASTLeaf = futureMatch.ASTLeaf
    _console.log('futureMatch ASTLeaf', ASTLeaf)

    switch (ASTLeaf.type) {
      case "mustacheVar" :
        obj[ASTLeaf.label] = match[futureMatch.matchIdx]
        break
      case "root" :
        break
      case "section" :
        if (futureMatch.ASTLeaf !== tplAST) { // we check for infinite loop
          obj[ASTLeaf.label] = {} //  create the subObj corresponding to section
          _parseRecur(match[futureMatch.matchIdx], ASTLeaf, obj[ASTLeaf.label]) // --> recur
        }
        break
      default :
        _console.assert(false, 'futureMatch ASTLeaf can not be of this type', ASTLeaf.type)
    }
  })
  _console.groupEnd()
  return obj
}

let __getRegExpPartByType :any = {}

__getRegExpPartByType.root = function(tplAST :ASTLeaf, futureMatches :MatchInfo[], storeMustacheVars :boolean = true) :string {
  _console.log('__getRegExpPartByType.root/section', tplAST)
  let storeMustacheVarsFlg = (futureMatches.length === 0)
  let futureMatch :MatchInfo = {
    matchIdx  : futureMatches.length, // idx in the match array
    ASTLeaf   : tplAST
  }
  futureMatches.push(futureMatch)

  let regExpPart = ''
  tplAST.children.forEach((child) => regExpPart += __getRegExpPartByType[child.type](child, futureMatches, storeMustacheVarsFlg))
  return storeMustacheVarsFlg ? regExpPart : `(${regExpPart})`
}

__getRegExpPartByType.section = __getRegExpPartByType.root

__getRegExpPartByType.strSwallowing = function(tplAST :ASTLeaf, futureMatches :MatchInfo[]) :string {
  return ''
}

__getRegExpPartByType.text = function(tplAST :ASTLeaf, futureMatches :MatchInfo[]) :string {
  return _escapeRegExp(tplAST.src)
}

__getRegExpPartByType.mustacheVar = function(tplAST :ASTLeaf, futureMatches :MatchInfo[], storeMustacheVars :boolean = true) :string {
  if (storeMustacheVars) {
    // If futureMatches array is given, we want to store the value of the mustache,
    // we push the ASTLeaf in array to program extraction
    let futureMatch :MatchInfo = {
      matchIdx  : futureMatches.length, // idx in the match array
      ASTLeaf   : tplAST
    }
    futureMatches.push(futureMatch)
  }
  return "(" + (storeMustacheVars ? "" : "?:") + ".*)"
}

function _escapeRegExp(str :string) { // cf : https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Expressions_r%C3%A9guli%C3%A8res
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
