import BaseTranslate from "./translate";
import gTranslate from 'google-translate-api'

export default class GoogleTranslate extends BaseTranslate {
    async _translate(content: string, opts: { from?: string, to?: string }): Promise<string> {
        let result = await gTranslate(content, {to: 'zh-CN'})
        return result.text
    }
}