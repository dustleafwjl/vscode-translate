import { Connection, TextDocumentPositionParams, Hover, TextDocuments, TextDocument } from 'vscode-languageserver';
import { ICommentBlock, IGrammarExtensions } from './types';
import CommentParse from './statementProcess/CommentPares';
import GoogleTranslate from './translate/GoogleTranslate';
import BaseTranslate from './translate/translate';
import { TextMateService } from './statementProcess/TextMateService';

export default class CommentHandler {
	private _translateor: BaseTranslate
	private _textMateService: TextMateService
	constructor(grammarExtensions: IGrammarExtensions[], private _documents: TextDocuments, private _connection: Connection) {
		this._translateor = new GoogleTranslate
		this._textMateService = new TextMateService(grammarExtensions)
	}
	public async tranlate(text: string) {
		return this._translateor.translate(text, {})
	}

	// 获取client端选中数据块
	public async _getSelectComment(position: TextDocumentPositionParams): Promise<ICommentBlock> {
		return await this._connection.sendRequest<ICommentBlock>('selectContains', position)
	}
	// 获取文件解析器
	private async _getFileTextParse(textDoc: TextDocument) {
		const grammar = await this._textMateService.createGrammar(textDoc.languageId)	
		const parse: CommentParse = new CommentParse(textDoc, grammar)
		return parse
	}

	//
	public async getComment(position: TextDocumentPositionParams): Promise<Hover | null> {
		let textDocument = this._documents.get(position.textDocument.uri);
		if (!textDocument) return null;
		const commentParse = await this._getFileTextParse(textDocument)
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