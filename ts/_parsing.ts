import { ASTLeaf, MatchInfo, RevParseFlat} from "./_interfaces"
import { compile } from "./_compile_AST"
import { _console } from "./_debug"

let tplAST :ASTLeaf

/**
 * Main function wich parses the source with a TPL or the ASTLeaf associated (and precompiled with compile method)
 * The result will be a "jsonisable" js object
 * @function parse
 * @public
 * @param {string} source : the text source
 * @param {string | ASTLeaf} tpl : the template source (or the compiled ASTLeaf)
 */
export function parse(source :string, tpl :string | ASTLeaf) :any {
  if (typeof tpl === 'string')
    tplAST = compile(tpl)
  else
    tplAST = tpl as ASTLeaf
  let obj = {}
  _console.log('')
  _console.log('')
  _console.log('Begin of parsing')
  _console.log('src :', source)
  return _parseRecur(source, tplAST, obj)
}


/**
 * If you have just parsed a source, you can get the ASTLeaf compiled from the tpl for debug purpose
 * @function getLastAST
 * @public
 * @return {ASTLeaf} the compiled Abstract Syntax Tree of the template
 */
export function getLastAST() :ASTLeaf {
  return tplAST
}

function _parseRecur(source :string, tplAST :ASTLeaf, obj :any) :any {
  _console.group()
  _console.log(`parseRecur for leaf of type (${tplAST.type}) : `, tplAST.label)
  _console.assert(source !== undefined, 'source must be a string')

  let futureMatches :MatchInfo[] = []

  // Generate regexp to get the children values in src with the cur ASTLeaf
  let regExpStr = __getRegExpPartByType[tplAST.type](tplAST, futureMatches)
  let regExp = new RegExp(regExpStr)
  _console.log('regExp generated :', regExpStr)

  if (tplAST.info && (tplAST.info.repeatMode === '*' || tplAST.info.repeatMode === "+")) {
    let sourceWalker = source
    let regExpStrNoRepeat = __getRegExpPartByType[tplAST.type](tplAST, undefined, true, true)
    let regExpNoRepeat = new RegExp(regExpStrNoRepeat)
    _console.log('regExp no Repeat generated :', regExpNoRepeat)

    while (sourceWalker.length > 0) {
      let sectionParse = {}
      obj.push(sectionParse)
      sourceWalker = _match(sourceWalker, regExpNoRepeat, sectionParse)
    }
  }
  else {
    _match(source, regExp, obj)
  }

  function _match(source :string, regExp :RegExp, obj :any) {
    let match = source.match(regExp)

    if (match === null) throw "Parse failed, the tpl does not match source" // --> Parse Exception

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
            if (!match[futureMatch.matchIdx] || match[futureMatch.matchIdx].length === 0) {
              if (futureMatch.ASTLeaf.info.repeatMode === "" || futureMatch.ASTLeaf.info.repeatMode === "+")
                throw `Parse failed, the tpl does not match source (section "${ASTLeaf.label}" is mandatory)` // --> Parse Exception

              break
            }
            obj[ASTLeaf.label] = ASTLeaf.info.repeatMode === '*' || ASTLeaf.info.repeatMode === '+' ? [] : {} //  create the subObj corresponding to section
            _parseRecur(match[futureMatch.matchIdx], ASTLeaf, obj[ASTLeaf.label]) // --> recur
          }
          break
        default :
          _console.assert(false, 'futureMatch ASTLeaf can not be of this type', ASTLeaf.type)
      }
    })
    _console.groupEnd()
    return source.substr(match[0].length)
  }
  return obj
}

let __getRegExpPartByType :any = {}

__getRegExpPartByType.root = function(tplAST :ASTLeaf, futureMatches :MatchInfo[], storeMustacheVars :boolean = true, disableRepeat :boolean = false) :string {
  _console.log('__getRegExpPartByType.root/section', tplAST)
  let storeMustacheVarsFlg = (storeMustacheVars === false ? false : (disableRepeat === true || futureMatches.length === 0))
  if (futureMatches) {
    let futureMatch :MatchInfo = {
      matchIdx  : futureMatches.length, // idx in the match array
      ASTLeaf   : tplAST
    }
    futureMatches.push(futureMatch)
  }
  let regExpPart = ''
  tplAST.children.forEach((child) => regExpPart += __getRegExpPartByType[child.type](child, futureMatches, storeMustacheVarsFlg))
  let repeatMode =  ((tplAST.info && tplAST.info.repeatMode && (! disableRepeat)) ? tplAST.info.repeatMode : '')
  return storeMustacheVarsFlg ? `(?:(?:${regExpPart})${repeatMode})` : `((?:${regExpPart})${repeatMode})`
}

__getRegExpPartByType.section = __getRegExpPartByType.root

__getRegExpPartByType.strSwallowing = function(tplAST :ASTLeaf, futureMatches :MatchInfo[]) :string {
  return ''
}

__getRegExpPartByType.text = function(tplAST :ASTLeaf, futureMatches :MatchInfo[]) :string {
  return _escapeRegExp(tplAST.src)
}

__getRegExpPartByType.mustacheVar = function(tplAST :ASTLeaf, futureMatches :MatchInfo[], storeMustacheVars :boolean = true) :string {
  if (storeMustacheVars && futureMatches) {
    // If futureMatches array is given, we want to store the value of the mustache,
    // we push the ASTLeaf in array to program extraction
    let futureMatch :MatchInfo = {
      matchIdx  : futureMatches.length, // idx in the match array
      ASTLeaf   : tplAST
    }
    futureMatches.push(futureMatch)
  }
  let regExpPart = ((tplAST.info && tplAST.info.regExp !== '') ? tplAST.info.regExp : ".*") // by default we match everithing, but it can cause conflicts
  return `(${(storeMustacheVars ? "" : "?:")}${regExpPart})`
}

function _escapeRegExp(str :string) { // cf : https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Expressions_r%C3%A9guli%C3%A8res
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function reverseParseDebug(source :string, tpl :string | ASTLeaf) :any {
  if (typeof tpl === 'string')
    tplAST = compile(tpl)
  else
    tplAST = tpl as ASTLeaf
  let obj = {}
  _console.log('')
  _console.log('')
  _console.log('Begin of reverse parsing')
  _console.log('src :', source)
  let dpLevel2ASTLeaves :RevParseFlat[][] = []
  _reverseParseFlatten(tplAST, dpLevel2ASTLeaves)

  for (let i = dpLevel2ASTLeaves.length - 1; i >= 0; i--) {
    __matchLonelySection(source, tplAST, dpLevel2ASTLeaves[i])
  }
}

function __matchLonelySection(source :string, tplAST :ASTLeaf, revParseFlats :RevParseFlat[]) {
  revParseFlats.forEach((revParseFlat) => {
    let regExpStr :string = __getRegExpPartByType.root(revParseFlat.ASTLeaf, [], false)
    let regExp = new RegExp(regExpStr, 'g')
    let match
    while (match = regExp.exec(source)) {
      revParseFlat.occurencies.push(match[1])
    }
  })
}
function _reverseParseFlatten(tplAST :ASTLeaf, dpLevel2ASTLeaves :RevParseFlat[][], level :number = 0) :void {
  tplAST.children.forEach((child) => _reverseParseFlatten(child, dpLevel2ASTLeaves, level + 1))

  if (tplAST.type !== 'section' && tplAST.type !== 'root') return // --> return

  if (dpLevel2ASTLeaves[level] === undefined)
    dpLevel2ASTLeaves[level] = []

  dpLevel2ASTLeaves[level].push({ ASTLeaf: tplAST, occurencies: [] })
}
