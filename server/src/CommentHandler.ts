import { Connection, TextDocumentPositionParams, Hover, TextDocuments } from 'vscode-languageserver';
import { ICommentBlock } from './types';

export default class CommentHandler {
	private _translateor: null
	constructor(private _documents: TextDocuments, private _connection: Connection) {
		this._translateor = null
	}
	public async tranlate(text: string) {
		
	}

	// 获取client端选中数据块
	public async _getSelectComment(position: TextDocumentPositionParams): Promise<ICommentBlock> {
		return await this._connection.sendRequest<ICommentBlock>('selectContains', position)
	}

	//
	public async getComment(position: TextDocumentPositionParams): Promise<Hover | null> {
		let block = await this._getSelectComment(position)
		
		return {
			contents: ''
		}
	}
}