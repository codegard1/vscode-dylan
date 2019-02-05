import * as vscode from "vscode";
import * as path from 'path';
import { makeDylanProject } from './make-dylanproject';

export function activate(context: vscode.ExtensionContext) {
  const currentFileName: string = vscode.window.activeTextEditor.document.fileName;
  const currentFolder: string = path.dirname(currentFileName);
  // console.log('current file:', currentFileName);
  // console.log('current folder:', currentFolder);

  const command = "vscode-dylan.buildProject";
  const commandHandler = makeDylanProject;

  context.subscriptions.push(
    vscode.commands.registerCommand(command, commandHandler)
  )
}
