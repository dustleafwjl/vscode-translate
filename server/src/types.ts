import { Range } from 'vscode-languageserver';

export interface ICommentBlock {
	contents: string,
	range?: Range
}


export interface ITranslateOptions {
	from?: string,
	to?: string
}