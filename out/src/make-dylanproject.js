"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const child_process_1 = require("child_process");
const path = require("path");
const vscode = require("vscode");
/**
 * Get the Uri of the LID file in the same directory as the currently opened file
 */
function getLidFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentFileName = vscode.window.activeTextEditor.document.fileName;
        const currentFolderName = path.dirname(currentFileName);
        const relativePath = vscode.workspace.asRelativePath(currentFolderName);
        // const isCurrentFolderReal: boolean = fs.existsSync(currentFolderName); // redundant?
        const lidFile = yield vscode.workspace.findFiles(`${relativePath}/*.lid`, 'registry/*', 1);
        return lidFile;
    });
}
;
/**
 *
 * @param lidFile Uri of the LID file
 */
function invokeBuildTool(lidFile) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!lidFile)
                reject('No lid file found');
            // Absolute path of the LID file
            const lidFileName = lidFile[0].fsPath;
            // The name / absolute location of the Dylan Compiler
            const dylanCompiler = os.type() === "Windows_NT" ? 'dylan-compiler-with-tools.exe' : 'dylan-compiler-with-tools';
            // array of arguments to pass to the Compiler
            const buildArgs = os.type() === "Windows_NT" ? ['/build', lidFileName] : ['-build', lidFileName];
            // Announcement
            console.log(`Build project ${lidFile} from ${lidFileName}\n\n`);
            // Run the compiler in a new console and send the output to the local one
            child_process_1.execFile(dylanCompiler, buildArgs, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                else if (stderr) {
                    reject(stderr);
                }
                else {
                    resolve(stdout);
                }
            });
        }));
    });
}
/**
 *
 * @param lidFile The Uri of the project LID file
 */
function invokeProjectExecutable(lidFile) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        // strip the prject name from the lid file
        let projectName = yield (lidFile[0].path.split(/.*\/(.*)\.lid$/)[1]);
        console.log(projectName);
        // Determine the executable name by host OS
        const executableName = os.type() === "Windows_NT"
            ? `${projectName}.exe`
            : `${projectName}`;
        // This assumes the executable is in the default location
        const executableLocation = `${process.env.OPEN_DYLAN_USER_ROOT}\\bin\\${executableName}`;
        // Fail if the executable can't be located
        if (!fs.existsSync(executableLocation)) {
            reject(`Could not find the executable (${executableLocation})`);
        }
        // Announcement
        console.log(`About to run ${executableName}\n`);
        // Run the compiler in a new console and send the output to the local one
        child_process_1.execFile(executableLocation, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            else if (stderr) {
                reject(stderr);
            }
            else {
                resolve(stdout);
            }
        });
    }));
}
/**
 * The main function: successively find the LID file, build the project, then run the resulting executable
 * @returns 0: Error | 1: Success
 */
function makeDylanProject() {
    return __awaiter(this, void 0, void 0, function* () {
        getLidFile().then((name) => __awaiter(this, void 0, void 0, function* () {
            const isProjectBuilt = yield invokeBuildTool(name)
                .then(data => {
                console.log(data);
                return true;
            }, error => {
                console.error(`Error during invokeBuildTool: \n ${error}`);
                return false;
            });
            if (isProjectBuilt)
                invokeProjectExecutable(name)
                    .then(data => {
                    console.log(data);
                    return 0;
                }, err => {
                    console.error(`Error during invokeProjectExecutable: \n ${err}`);
                    return 1;
                });
        }), (err) => {
            console.log(`Error receiving project name in makeDylanProject():\n${err}`);
        });
    });
}
exports.makeDylanProject = makeDylanProject;
