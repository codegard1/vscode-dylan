"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    const command = "vscode-dylan.sayHello";
    const commandHandler = (name = 'world') => { console.log(`Hello, ${name}!`); };
    context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}
exports.activate = activate;
//# sourceMappingURL=dylanMain.js.map