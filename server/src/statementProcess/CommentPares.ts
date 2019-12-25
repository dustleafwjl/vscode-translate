import { TextDocument, TextDocumentPositionParams } from "vscode-languageserver"
import { ICommentBlock } from "../types"
import { IGrammar } from "vscode-textmate"

export default class CommentParse {
    private fileText: string[]
    constructor(document: TextDocument, private _grammar: IGrammar) {
        this.fileText = document.getText().split('\n')
    }
    
    public getTextByPosition(textDocPosition: TextDocumentPositionParams): ICommentBlock  {
        const {character, line} = textDocPosition.position
        console.log(textDocPosition)
        return {
            contents: "my promise is true"
        }
    }

    private _parseTextAtLine() {
        
    }
}