"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const make_dylanproject_1 = require("./make-dylanproject");
function activate(context) {
    const command = "vscode-dylan.buildProject";
    const commandHandler = make_dylanproject_1.makeDylanProject;
    context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
exports.activate = activate;
