import { Registry, parseRawGrammar, INITIAL, IGrammar, IRawGrammar } from 'vscode-textmate'
import CommentParse from './CommentPares'
import fs from 'fs'
import { IGrammarExtensions } from '../types'
import GarmmarLib from './GarmmarLib'
import path from 'path'



/**
 * 使其能够更具vscdoe传入的语言类型，返回相应的grammar
 */
export class TextMateService {
    private _grammarlib: GarmmarLib
    private _grammarCache: Map<number, IGrammar>
    constructor(grammarExtensions: IGrammarExtensions[]) {
        this._grammarlib = new GarmmarLib(grammarExtensions)
    }

    // 根据传入的languageId创造一个grammar
    public async createGrammar(languageId: string): Promise<IGrammar> {
        return this._createGrammar(languageId)
    }
    private async _createGrammar(languageId: string): Promise<IGrammar> {
        const { scopeName: gScopeName, location, path: uri } = this._grammarlib.getGarmmarById(languageId)
        const grammarLocation = path.join(location, uri);
        const registry = new Registry({
            loadGrammar: (scopeName: string) => {
                if(scopeName === gScopeName) {
                    return new Promise<IRawGrammar>((resolve, reject) => {
                        fs.readFile(grammarLocation, { encoding: "utf-8" }, (error, data) => {
                            if(error) {
                                console.log("读取文件错误")
                                reject(error)
                            }else {
                                const rawGrammar: IRawGrammar = parseRawGrammar(data.toString(), grammarLocation)
                                resolve(rawGrammar)
                            }
                        })
                    })
                }
                console.log('unkonw scope name:', scopeName)
                return null
            }
        });
        let garmmar = await registry.loadGrammar(gScopeName)
        return garmmar
    }
}


