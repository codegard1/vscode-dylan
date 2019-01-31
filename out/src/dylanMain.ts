import * as vscode from "vscode";


export function activate(context: vscode.ExtensionContext) {
  const command = "vscode-dylan.buildProject";

  const commandHandler = () => {

  }

  context.subscriptions.push(
    vscode.commands.registerCommand(command, commandHandler)
  )
}
