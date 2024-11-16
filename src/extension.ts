import * as vscode from 'vscode';
import axios from 'axios';
import { debounce } from 'lodash';

// Tailwind CSS classes (initial set)
const tailwindClasses = [
    'text-sm', 'text-lg', 'font-bold', 'text-red-500', 'bg-blue-200',
    'p-4', 'm-2', 'flex', 'items-center', 'justify-between',
    'w-full', 'h-screen', 'rounded-lg', 'shadow-md', 'hover:bg-gray-100',
    'transition', 'duration-300', 'ease-in-out', 'transform', 'hover:scale-105'
];

// Bootstrap classes (initial set)
const bootstrapClasses = [
    'container', 'row', 'col', 'btn', 'btn-primary', 'form-control',
    'card', 'nav', 'navbar', 'jumbotron', 'alert', 'alert-success',
    'table', 'table-striped', 'badge', 'badge-secondary', 'text-muted'
];

// Context-aware suggestions
const contextAwareSuggestions: { [key: string]: string[] } = {
    div: ['w-full', 'h-full', 'flex', 'items-center', 'justify-center'],
    span: ['inline-block', 'text-sm', 'font-bold'],
    button: ['btn', 'px-4', 'py-2', 'rounded', 'bg-blue-500', 'text-white'],
    input: ['form-control', 'border', 'rounded', 'px-2', 'py-1'],
    a: ['text-blue-500', 'hover:underline']
};

let currentFramework = 'tailwind';
let cachedTailwindClasses: string[] = [];
let cachedBootstrapClasses: string[] = [];
let lastFetchTime: { [key: string]: number } = { tailwind: 0, bootstrap: 0 };
let statusBarItem: vscode.StatusBarItem;

// Class descriptions for hover information
const classDescriptions: { [key: string]: string } = {
    'text-sm': 'Sets the font size to small',
    'text-lg': 'Sets the font size to large',
    'font-bold': 'Sets the font weight to bold',
    'text-red-500': 'Sets the text color to red (shade 500)',
    'bg-blue-200': 'Sets the background color to blue (shade 200)',
	'p-4': 'Applies padding of 1 rem (16px) on all sides of the element',
	'm-2': 'Adds a margin of 0.5 rem (8px) around the element',
	'flex': 'Sets the display of the element to flex, enabling flexible layout options for its children',
	'items-center': 'Aligns items along the cross-axis (vertically in a row layout) to the center within a flex container',
	'justify-between': 'Spaces items within a flex container so that there is space between them, pushing the first child to the start and the last child to the end',
	'w-full': 'Sets the width of the element to 100% of its parent container',
	'h-screen': 'Sets the height of the element to be 100% of the viewport height.',
	'rounded-lg': 'Applies a large border-radius to the element, giving it rounded corners',
	'shadow-md': 'Adds a medium-sized box shadow to the element for a subtle 3D effect',
	'hover:bg-gray-100': 'Changes the background color to light gray (gray-100) on hover',
	'transition': 'Enables smooth transitions for all properties that change (such as background color or transform)',
	'duration-300': ' Sets the duration of transitions to 300ms, making animations and transitions smooth and gradual',
	'ease-in-out': 'Applies an ease-in-out timing function, which accelerates and decelerates the transition smoothly',
	'transform': 'Enables transformations like scaling, rotating, or translating the element',
	'hover:scale-105': 'Increases the scale of the element to 105% on hover, creating a slight zoom effect.'
    // Add more descriptions as needed
};

async function fetchLatestClasses(framework: string): Promise<string[]> {
    const now = Date.now();
    const cacheTime = 3600000; // 1 hour in milliseconds

    if (now - lastFetchTime[framework] < cacheTime) {
        return framework === 'tailwind' ? cachedTailwindClasses : cachedBootstrapClasses;
    }

    try {
        let url = framework === 'tailwind' 
            ? 'https://tailwindcss.com/docs/utility-first'
            : 'https://getbootstrap.com/docs/5.1/utilities/background/';
        
        const response = await axios.get<string>(url);
        const html = response.data;
        const regex = framework === 'tailwind' 
            ? /class="([^"]+)"/g
            : /\.([\w-]+)/g;
        
        const matches = html.match(regex) as RegExpMatchArray | null;
        if (matches) {
            const fetchedClasses = matches.map((match: string) => 
                framework === 'tailwind' ? match.slice(7, -1) : match.slice(1)
            ).flatMap(cls => cls.split(' '));
            
            const uniqueClasses = [...new Set(fetchedClasses)];
            
            if (framework === 'tailwind') {
                cachedTailwindClasses = uniqueClasses;
            } else {
                cachedBootstrapClasses = uniqueClasses;
            }
            
            lastFetchTime[framework] = now;
            return uniqueClasses;
        }
    } catch (error) {
        console.error(`Failed to fetch latest ${framework} classes:`, error);
    }

    return framework === 'tailwind' ? tailwindClasses : bootstrapClasses;
}

const supportedLanguages = ['html', 'javascript', 'typescript', 'javascriptreact', 'typescriptreact'];

export function activate(context: vscode.ExtensionContext) {
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = `CSS Framework: ${currentFramework}`;
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    let disposable = vscode.commands.registerCommand('cssUtilityAutocomplete.setFramework', async () => {
        const framework = await vscode.window.showQuickPick(['tailwind', 'bootstrap'], {
            placeHolder: 'Select CSS framework'
        });
        if (framework) {
            currentFramework = framework;
            statusBarItem.text = `CSS Framework: ${currentFramework}`;
            vscode.window.showInformationMessage(`CSS framework set to ${framework}`);
        }
    });

    context.subscriptions.push(disposable);

    // Register configuration change event
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('cssUtilityAutocomplete.customClasses')) {
            vscode.window.showInformationMessage('Custom classes configuration changed. Reload window to apply changes.');
        }
    }));

    const provider = vscode.languages.registerCompletionItemProvider(
        // { scheme: 'file', language: 'html' },
		supportedLanguages.map(language => ({scheme: 'file', language})),
        {
            provideCompletionItems: debounce(async (document: vscode.TextDocument, position: vscode.Position) => {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
				console.log(`Language: ${document.languageId}, Line prefix: ${linePrefix}`); // Debug log
                if (!shouldTriggerCompletion(document.languageId, linePrefix)) {
					console.log('Completion not triggered');
                    return undefined;
                }
				console.log('Completion triggered');
				console.log('Fetching classes');
                let classes = await fetchLatestClasses(currentFramework);

                // Get custom classes from configuration
                const config = vscode.workspace.getConfiguration('cssUtilityAutocomplete');
                const customClasses = config.get<string[]>('customClasses', []);
                classes = [...classes, ...customClasses];

                // Get the current element type for context-aware suggestions
                const elementRegex = /<(\w+)[\s>]/;
                const elementMatch = linePrefix.match(elementRegex);
                const elementType = elementMatch ? elementMatch[1] : '';

                // Add context-aware suggestions
                if (elementType && contextAwareSuggestions[elementType]) {
                    classes = [...classes, ...contextAwareSuggestions[elementType]];
                }

				console.log(`Returning ${classes.length} suggestions`);
                return classes.map(className => {
                    const completionItem = new vscode.CompletionItem(className, vscode.CompletionItemKind.Value);
                    completionItem.detail = `${currentFramework.charAt(0).toUpperCase() + currentFramework.slice(1)} CSS class`;
                    completionItem.documentation = classDescriptions[className] || 'No description available';
                    return completionItem;
                });
            }, 300) // 300ms debounce
        }
    );

    context.subscriptions.push(provider);

	function shouldTriggerCompletion (languageId: string, linePrefix: string): boolean {
		switch (languageId) {
			case 'html':
				return linePrefix.endsWith('class="') || linePrefix.includes('class="');
			case 'javascript':
			case 'typescript':
			case 'javascriptreact':
			case 'typescriptreact':
				return linePrefix.endsWith('className="') || linePrefix.includes('className="') || linePrefix.endsWith('class="') || linePrefix.includes('class="');
			default:
				return false;
		}
	}

    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider('html', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
            if (classDescriptions[word]) {
                return new vscode.Hover(classDescriptions[word]);
            }
        }
    });

    context.subscriptions.push(hoverProvider);
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}