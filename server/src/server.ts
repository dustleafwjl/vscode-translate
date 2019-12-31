import {
	createConnection,
	TextDocuments,
	TextDocument,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	Hover
} from 'vscode-languageserver';
import CommentHandler from './CommentHandler';


// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();

let commentHandler: CommentHandler

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;
connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;
	commentHandler = new CommentHandler(params.initializationOptions.grammarExtensions, documents, connection)
	// Does the client support the `workspace/configuration` request?
	// If not, we will fall back using global settings
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	return {
		capabilities: {
			hoverProvider: true,
			textDocumentSync: documents.syncKind,
			// Tell the client that the server supports code completion
			completionProvider: {
				resolveProvider: true
			}
		}
	};
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
	connection.window.showInformationMessage('Hello World! form server side');
});



let last: Map<string, Hover> = new Map();
connection.onHover(async (position: TextDocumentPositionParams) => {
	let hover = await commentHandler.getComment(position)
	return {
		contents: [`[Dustleaf Translate]`, '\r \n' + await commentHandler.translate(hover?.contents as string, {from: "en", to: "zh-CN"}) ]
	}
});

connection.onRequest('translate', (text: string) => {
	if (!commentHandler) return null;
	return commentHandler.translate(text, {from: "zh-CN", to: "en"});
});

documents.listen(connection);

// Listen on the connection
connection.listen();
