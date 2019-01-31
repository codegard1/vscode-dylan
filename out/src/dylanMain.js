"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    const command = "vscode-dylan.buildProject";
    const commandHandler = () => {
    };
    context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
exports.activate = activate;
