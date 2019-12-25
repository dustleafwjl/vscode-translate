import { IGarmmarInfo, IGrammarExtensions } from "../types";

/**
 * 将vscode中的语法信息存储起来，方便以后获取
 */
export default class GarmmarLib {
    private _garmmar: Map<string, IGarmmarInfo> = new Map()
    constructor(grammarExtensions: IGrammarExtensions[]) {
        this._init(grammarExtensions)
    }
    private _init(grammarEs: IGrammarExtensions[]) {
        grammarEs.forEach(extension => {
            const location = extension.extensionLocation
            extension.value.forEach(ele => {
                let id: string 
                extension.languages.forEach(lan => {
                    if(lan.name === ele.language) {
                        id = ele.language
                    }
                })
                this._garmmar.set(id, {
                    language: ele.language,
                    scopeName: ele.scopeName,
                    location: location,
                    path: ele.path
                })
            })
        })
    }
    // 通过languageId获取garmmarInfo
    public getGarmmarById(id: string): IGarmmarInfo {
        return this._garmmar.get(id)
    }
}