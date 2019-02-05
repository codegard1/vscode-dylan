import * as vscode from "vscode";
import { makeDylanProject } from './make-dylanproject';

export function activate(context: vscode.ExtensionContext) {
  const command = "vscode-dylan.buildProject";
  const commandHandler = makeDylanProject;
  context.subscriptions.push(
    vscode.commands.registerCommand(command, commandHandler)
  )
}
