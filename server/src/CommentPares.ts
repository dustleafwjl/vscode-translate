import { TextDocument, TextDocumentPositionParams } from "vscode-languageserver"
import { ICommentBlock } from "./types"


export default class CommentParse {
    private fileText: string[]
    constructor(document: TextDocument) {
        this.fileText = document.getText().split('\n')
    }
    
    public getTextByPosition(textDocPosition: TextDocumentPositionParams): ICommentBlock  {
        const {character, line} = textDocPosition.position
        console.log(textDocPosition)
        return {
            contents: "my promise is true"
        }
    }
}