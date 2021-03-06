import { TextDocument, TextDocumentPositionParams, Range } from "vscode-languageserver"
import { ICommentBlock, ITokenState, ITokenAndText } from "../types"
import { IGrammar, StackElement, IToken } from "vscode-textmate"

export function isUpperCase(ch: string) {
    return ch >= 'A' && ch <= 'Z'
}

export function isLowerCase(ch: string) {
    return ch >= 'a' && ch <= 'z'
}

export function hasEndMark(ch: string) {
    let lastLineEndCharacter = ch.substring(ch.length - 1);
    return lastLineEndCharacter !== '.';
}

export default class CommentParse {
    private fileText: string[]
    private _lines: ITokenState[] = []
    constructor(document: TextDocument, private _grammar: IGrammar, private _multiLineMerge: boolean = false) {
        this.fileText = document.getText().split('\n')
    }
    //跨行元素合并
    private _mergeComment(oldComment: string, newLine: string): string {
        if (this._multiLineMerge) {
            let lastLine = oldComment.substring(oldComment.lastIndexOf('\n') + 1);
            lastLine = lastLine.replace(/^([\/\ \*])*/, '');
            let currentLine: string = newLine.replace(/^([\/\ \*])*/, '');
            if (isUpperCase(lastLine) && hasEndMark(lastLine) && isLowerCase(currentLine)) {
                return oldComment + ' ' + currentLine;
            }
        }
        console.log("merge oldComment", oldComment)
        console.log("merge newLine", newLine)
        return oldComment + '\n' + newLine;
    }
    /**
     * 用于将fileText和tokens整合成所需要的格式{ITokenAndText}
     * @param tokens 改行的标记
     * @param line 行数
     * @param tokenIndex 哪一个token
     */
    private _parseScope(tokens: IToken[], line: number, tokenIndex: number): ITokenAndText {
        let { startIndex, endIndex, scopes } = tokens[tokenIndex]
        scopes = scopes.map(ele => escape(ele)).reverse()
        let text = this.fileText[line].substring(startIndex, endIndex)
        return {
            startIndex,
            endIndex,
            text,
            scopes
        }
    }

    /**
     * 将源文本数组0~lineNumber的元素通过grammar打上标记
     * @param lineNumber 要parse的行数
     */
    private _parseTokensWithLine(lineNumber: number): ITokenState[] {
        let state: StackElement | null = null
        let linesLength: number = this._lines.length
        if(linesLength) {
            // 如果lines的长度不等于0， 继续上次解析
            state = this._lines[linesLength - 1].endState
        }
        // 如果传入的lineNumber小于linesLength，不进行操作，直接返回
        for(let i = linesLength; i <= lineNumber; i ++) {
            let result = this._grammar.tokenizeLine(this.fileText[i], state)
            this._lines.push({
                startState: state,
                tokens: result.tokens,
                endState: result.ruleStack
            })
            state = result.ruleStack
        }
        return this._lines
    }
    private _getTokensAtLine(lineNumber: number) {
        const lines = this._parseTokensWithLine(lineNumber)
        return lines[lineNumber]
    }
    private _multiScope(
        {dataTokens, tokenIndex, positionLine}: {dataTokens: IToken[], tokenIndex: number, positionLine: number}, 
        handleCheckText: (scopes: string[]) => boolean, maxLine: number, minLine: number, 
        skipContentHandle?: (scopes: string) => boolean): ICommentBlock {
            let { startIndex, endIndex, text, scopes } = this._parseScope(dataTokens, positionLine, tokenIndex)
            let startLine = minLine
            let endLine = maxLine
            // 合并当前坐标之前的同类型节点
            for(let line = positionLine, tokens = dataTokens, tIndex = tokenIndex; line >= minLine;) {
                let index: number
                for(index = tIndex - 1; index >= 0; index --) {
                    let res = this._parseScope(tokens, line, index)
                    if (skipContentHandle && skipContentHandle(res.scopes[0])) {
                        continue;
                    }
                    if(handleCheckText(res.scopes)) {
                        text = res.text + text
                        startIndex = res.startIndex,
                        startLine = line
                    }else {
                        break
                    }
                }
                if(index >= 0) break
                line -= 1
                if(line >= minLine) {
                    let dataPre = this._getTokensAtLine(line)
                    tokens = dataPre.tokens
                    tIndex = dataPre.tokens.length
                    text = '\n' + text
                }
            }
            // 合并当前节点之后的同类型节点
            for(let line = positionLine, tokens = dataTokens, tIndex = tokenIndex; line <= maxLine;) {
                let index: number
                for(index = tIndex + 1; index < tokens.length; index ++) {
                    let res = this._parseScope(tokens, line, index)
                    if (skipContentHandle && skipContentHandle(res.scopes[0])) {
                        continue;
                    }
                    if(handleCheckText(res.scopes)) {
                        text = text + res.text
                        endIndex = res.endIndex
                        endLine = line
                    } else {
                        break
                    }
                }
                // 外层循环出口， 和内层for循环公用一个index，当内层循环break之后，外层也break
                if(index < tokens.length) {
                    break
                }
                line += 1
                if(line <= maxLine) {
                    let data = this._getTokensAtLine(line)
                    tokens = data.tokens
                    tIndex = -1
                    text = text + '\n'
                }
            }
            let newText = ''
            text.split("\n").forEach(item => {
                newText = this._mergeComment(newText, item)
            })

            let range = Range.create({
                character: startIndex,
                line: startLine
            }, {
                character: endIndex,
                line: endLine
            })
            return {
                contents: newText,
                range
            }
    }
    /**
     * 根据位置返回相应的内容(ICommentBlock)
     * @param textDocPosition 文本
     */
    public getTextByPosition(textDocPosition: TextDocumentPositionParams): ICommentBlock  {
        const {character, line} = textDocPosition.position
        const data = this._getTokensAtLine(line)
        // 定位光标在字符中的起始坐标
        let tokenIndex = 0
        for(let i = data.tokens.length - 1; i >= 0; i --) {
            let token = data.tokens[i]
            // 递减循环，如果光标位置character小于token的startIndex，赋值tokenIndex
            if(character - 1 >= token.startIndex) {
                tokenIndex = i
            }
        }
        const { startIndex, endIndex, text , scopes} = this._parseScope(data.tokens, line, tokenIndex)
        if(TokenConversion.isBaseTranslate(scopes)) {
            // 基础变量，只需要一个token
            let range = Range.create({
                character: startIndex,
                line: line
            }, {
                character: endIndex,
                line
            })
            return {
                contents: text,
                range
            }
        }
        if(TokenConversion.isStringCommentTranslate(scopes)) {
            return this._multiScope({
                dataTokens: data.tokens,
                tokenIndex,
                positionLine: line
            }, TokenConversion.isCommentTranslate, line, line)
        }
        if(TokenConversion.isCommentTranslate(scopes)) {
            return this._multiScope({
                dataTokens: data.tokens,
                tokenIndex,
                positionLine: line
            }, TokenConversion.isCommentTranslate, this.fileText.length - 1, 0, TokenConversion.isSkipCommentTranslate)
        }
        return {
            contents: ""
        }
    }
}

export class TokenConversion {
    public static isCommentTranslate(scopes: string[]): boolean {
        //注释的token标记
        const arr = [
            'punctuation.definition.comment',
            'comment.block',
            'comment.line',
            'punctuation.whitespace.comment'
        ];
        return scopes.some(scope => {
            return arr.some(item => {
                return scope.indexOf(item) === 0
            });
        })
    }
    public static isSkipCommentTranslate(scope: string) {
        return scope.indexOf('punctuation.whitespace.comment') === 0
    }
    public static isStringCommentTranslate(scopes: string[]): boolean {
        const scope = scopes[0];
        //字符串和转义字符的token标记
        const arr = [
            'string.quoted',
            'constant.character.escape'
        ];

        return arr.some(item => {
            return scope.indexOf(item) === 0;
        });
    }
    public static isBaseTranslate(scopes: string[]): boolean {
        const scope = scopes[0];
        const arr = [
            'entity',
            'variable',
            'support',
            'meta.object-literal.key'
        ];
        return arr.some(item => {
            return scope.indexOf(item) === 0;
        });
    }
}