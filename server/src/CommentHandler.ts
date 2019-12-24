import { Connection, TextDocumentPositionParams, Hover, TextDocuments } from 'vscode-languageserver';
import { ICommentBlock } from './types';
import CommentParse from './CommentPares';
import GoogleTranslate from './translate/GoogleTranslate';
import BaseTranslate from './translate/translate';

export default class CommentHandler {
	private _translateor: BaseTranslate
	constructor(private _documents: TextDocuments, private _connection: Connection) {
		this._translateor = new GoogleTranslate
	}
	public async tranlate(text: string) {
		return this._translateor.translate(text, {})
	}

	// 获取client端选中数据块
	public async _getSelectComment(position: TextDocumentPositionParams): Promise<ICommentBlock> {
		return await this._connection.sendRequest<ICommentBlock>('selectContains', position)
	}
	// 获取文件解析器
	private _getFileTextParse() {

    }
	//
	public async getComment(position: TextDocumentPositionParams): Promise<Hover | null> {
		let textDocument = this._documents.get(position.textDocument.uri);
		if (!textDocument) return null;
		const commentParse = new CommentParse(textDocument)
		let block = await this._getSelectComment(position)
		console.log(block)
		if(!block) {
			block = commentParse.getTextByPosition(position)
		}
		return {
			contents: block.contents
		}
	}
}