import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { afterEach, beforeEach, describe, it } from 'mocha';

suite('Extension Test Suite', () => {
    beforeEach(() => {
        // Reset the VS Code window before each test
        vscode.window.showInformationMessage('Starting test suite');
    });

    afterEach(() => {
        // Clean up after each test
        sinon.restore();
    });

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('your-publisher.css-utility-autocomplete'));
    });

    test('Should provide completion items for HTML files', async () => {
        // Create a test file
        const document = await vscode.workspace.openTextDocument({
            content: '<div class=""',
            language: 'html'
        });

        // Get completion items
        const position = new vscode.Position(0, 11); // Position after class="
        const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            document.uri,
            position
        );

        assert.ok(completions.items.length > 0);
    });

    test('Should switch frameworks correctly', async () => {
        // Trigger framework switch command
        await vscode.commands.executeCommand('cssUtilityAutocomplete.setFramework');
        
        // Verify the framework was switched (you'll need to expose this information)
        // This is a basic test, you might need to adapt it based on your implementation
        const config = vscode.workspace.getConfiguration('cssUtilityAutocomplete');
        assert.strictEqual(config.get('framework'), 'bootstrap');
    });

    test('Should provide hover information', async () => {
        const document = await vscode.workspace.openTextDocument({
            content: '<div class="text-sm"',
            language: 'html'
        });

        const position = new vscode.Position(0, 15); // Position on "text-sm"
        const hover = await vscode.commands.executeCommand<vscode.Hover[]>(
            'vscode.executeHoverProvider',
            document.uri,
            position
        );

        assert.ok(hover.length > 0);
    });
});