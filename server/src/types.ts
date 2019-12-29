import { Range } from 'vscode-languageserver';
import { StackElement, IToken } from 'vscode-textmate';

export interface ICommentBlock {
	contents: string,
	range?: Range
}

// 从vscode总获取的语法配置
export interface IGarmmarInfo {
    location: string,
    language: string,
    scopeName: string,
    path: string
}

export interface ITranslateOptions {
	from?: string,
	to?: string
}


export interface TokenTypesContribution {
    [scopeName: string]: string;
}
export interface IEmbeddedLanguagesMap {
    [scopeName: string]: string;
}

export interface ITMSyntaxExtensionPoint {
    language: string;
    scopeName: string;
    path: string;
    embeddedLanguages: IEmbeddedLanguagesMap;
    tokenTypes: TokenTypesContribution;
    injectTo: string[];
}
export interface ITMLanguageExtensionPoint {
    id: number;
    name: string;
}

export interface IGrammarExtensions {
    value: ITMSyntaxExtensionPoint[];
    extensionLocation: string;
    languages: ITMLanguageExtensionPoint[];
}


export interface ITokenState {
    startState: StackElement | null;
    tokens: IToken[];
    endState: StackElement | null;
}

export interface ITokenAndText {
    startIndex: number,
    endIndex: number,
    scopes: string[],
    text: string
}