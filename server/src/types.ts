import { Range } from 'vscode-languageserver';

export interface ICommentBlock {
	contents: string,
	range: Range
}