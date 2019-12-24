import { ITranslateOptions } from "../types"

export default abstract class BaseTranslate {
    private _inRequest: Map<string, Promise<string>> = new Map()
    constructor() {
        
    }
    /**
     * 对翻译结果做缓存处理， 不用重复翻译
     * @param content 翻译原文
     * @param param1 参数
     */
    async translate(content: string, { from = 'auto', to = 'auto'}: ITranslateOptions): Promise<string> {
        let key = `form[${from}]to[${to}]-[${content}]`
        let action: Promise<string>
        if(this._inRequest.get(key)) {
            action = this._inRequest.get(key)!
        }
        action = this._translate(content, {from, to})
        this._inRequest.set(key, action)
        return await action
    }

    abstract async _translate(content: string, opts: { from?: string, to?: string}): Promise<string>
}