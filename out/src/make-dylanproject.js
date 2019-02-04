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
/**
 *
 * @param startPath The path in which to search. Default is the current directory
 * (i.e. the project directory)
 * @param filter Regular Expression identifying which type of file to search for.
 * Default is .lid
 */
function getProjectName(startPath = '.', filter = /\.lid$/) {
    // console.log('Starting from dir ' + startPath + '/');
    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return null;
    }
    const files = fs.readdirSync(startPath);
    let results = [];
    for (let i = 0; i < files.length; i++) {
        let filename = path.join(startPath, files[i]);
        let stat = fs.lstatSync(filename);
        // console.log(filter.test(filename));
        if (stat.isDirectory()) {
            getProjectName(filename, filter); //recurse
        }
        else if (filter.test(filename)) {
            results.push(filename);
        }
    }
    ;
    // Return the first lid file found or nothing
    return results.length > 0 ? results[0].split('.')[0] : '';
}
;
/**
 *
 * @param projectName Name of the project to build.
 */
function invokeBuildTool(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!projectName)
                reject('No lid file found');
            // Get the lid file 
            const lidFileName = `${projectName}.lid`;
            fs.exists(lidFileName, doesExist => {
                if (doesExist) {
                    console.log(`LID file does exist`);
                }
                else {
                    reject(`Error: Could not find the LID file (${lidFileName})`);
                }
            });
            // The name / absolute location of the Dylan Compiler
            const dylanCompiler = os.type() === "Windows_NT" ? 'dylan-compiler-with-tools.exe' : 'dylan-compiler-with-tools';
            // array of arguments to pass to the Compiler
            const buildArgs = os.type() === "Windows_NT" ? ['/build', lidFileName] : ['-build', lidFileName];
            // Announcement
            console.log(`Build project ${projectName} from ${lidFileName}\n`);
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
 * @param projectName
 */
function invokeProjectExecutable(projectName) {
    return new Promise((resolve, reject) => {
        const executableName = os.type() === "Windows_NT"
            ? `${projectName}.exe`
            : `${projectName}`;
        const executableLocation = `${process.env.OPEN_DYLAN_USER_ROOT}\\bin\\${executableName}`;
        if (fs.existsSync(executableLocation)) {
            console.log(`${executableLocation} does exist.`);
        }
        else {
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
    });
}
function makeDylanProject(projectName = getProjectName()) {
    return __awaiter(this, void 0, void 0, function* () {
        yield invokeBuildTool(projectName)
            .then(data => {
            console.log(data);
        }, error => {
            console.error(`Error during invokeBuildTool: \n ${error}`);
        });
        yield invokeProjectExecutable(projectName)
            .then(data => {
            console.log(data);
            return 0;
        })
            .catch(data => {
            console.error(`Error during invokeProjectExecutable: \n ${data}`);
        });
    });
}
exports.makeDylanProject = makeDylanProject;
makeDylanProject(); //testing
