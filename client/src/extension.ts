
import * as path from 'path';
import { workspace, ExtensionContext, commands, window, Selection, Hover, Position, env, extensions } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
	TextDocumentPositionParams,
    Range
} from 'vscode-languageclient';
import { IGrammarExtensions, ITMLanguageExtensionPoint } from './types';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=16009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// 将vscode中的language拿出来，传如server端
	let extAll = extensions.all;
    let languageId = 2;
    let grammarExtensions: IGrammarExtensions[] = [];
    let canLanguages: string[] = [];
    extAll.forEach(extension => {
        if (!(extension.packageJSON.contributes && extension.packageJSON.contributes.grammars)) return;
        let languages: ITMLanguageExtensionPoint[] = [];
        (extension.packageJSON.contributes && extension.packageJSON.contributes.languages || []).forEach((language: any) => {
            languages.push({
                id: languageId++,
                name: language.id
            });
        })
        grammarExtensions.push({
            languages: languages,
            value: extension.packageJSON.contributes && extension.packageJSON.contributes.grammars,
            extensionLocation: extension.extensionPath
        });
        canLanguages = canLanguages.concat(extension.packageJSON.contributes.grammars.map((g: any) => g.language));
    });

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		// revealOutputChannelOn: 4,
		documentSelector: [{ scheme: 'file', language: 'typescript' }],
		initializationOptions: {
			grammarExtensions,
			appRoot: env.appRoot
        },
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);


	console.log('extensions', extensions)
	console.log("grammer", extensions.all)
	// Start the client. This will also launch the server
	client.start();
    await client.onReady();
    
    interface ICommentBlock {
        contents: string,
        range: Range
    }
	client.onRequest<ICommentBlock, TextDocumentPositionParams>('selectContains', (docPosition: TextDocumentPositionParams) => {
		let editor = window.activeTextEditor;
        //有活动editor，并且打开文档与请求文档一致时处理请求
        if (editor && editor.document.uri.toString() === docPosition.textDocument.uri) {
            //类型转换
            let position = new Position(docPosition.position.line, docPosition.position.character);
            let selection = editor.selections.find((selection) => {
                return !selection.isEmpty && selection.contains(position);
            });
            if (selection) {
                return {
                    range: selection,
                    contents: editor.document.getText(selection)
                };
            }
        }
        return null;
	})
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
