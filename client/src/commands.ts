
import { window, Selection } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { toLittleHump } from './util/formatString';


export async function variableConversion(client: LanguageClient): Promise<void> {
    let editor = window.activeTextEditor
    if (!(editor && editor.document &&
        editor.selections.some(selection => !selection.isEmpty))) {
        return client.outputChannel.append(`No selection！\n`)
    }
    let translates = editor.selections
        .filter(selection => !selection.isEmpty)
            .map(selection => {
                let text = editor.document.getText(selection)
                return translateSelection(text, selection)
            })

    //给选中区域添加装饰，提醒用户正在翻译中。 部分内容会原样返回，避免用户等待
    let decoration = window.createTextEditorDecorationType({
        color: '#FF2D00',
        backgroundColor: "transparent"
    })

    // 将一组装饰添加到文本编辑器。 如果给定的[decoration type]（＃TextEditorDecorationType）已经存在一组装饰，则将替换它们。
    editor.setDecorations(decoration, editor.selections)
    let beginTime = Date.now()
    try {
        let results = await Promise.all(translates)
        //最少提示1秒钟
        setTimeout(() => {
            decoration.dispose()
        }, 1000 - (Date.now() - beginTime))
        editor.edit(builder => {
            results.forEach(item => {
                item.translation && builder.replace(item.selection, item.translation)
            })
        })
    } catch (e) {
        decoration.dispose();
        client.outputChannel.append(e)
    }
    async function translateSelection(text: string, selection: Selection): Promise<{ translation: string, selection: Selection }> {
        let translation = toLittleHump(await client.sendRequest<string>('translate', text))
        return { translation, selection }
    }
}

