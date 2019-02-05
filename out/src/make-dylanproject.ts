import * as fs from 'fs';
import * as os from 'os';
import { execFile } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Get the Uri of the LID file in the same directory as the currently opened file
 */
async function getLidFile(): Promise<vscode.Uri[]> {
  const currentFileName: string = vscode.window.activeTextEditor.document.fileName;
  const currentFolderName: string = path.dirname(currentFileName);
  const relativePath: string = vscode.workspace.asRelativePath(currentFolderName);
  // const isCurrentFolderReal: boolean = fs.existsSync(currentFolderName); // redundant?

  const lidFile = await vscode.workspace.findFiles(`${relativePath}/*.lid`, 'registry/*', 1);
  return lidFile;
};

/**
 * 
 * @param lidFile Uri of the LID file 
 */
async function invokeBuildTool(lidFile: vscode.Uri[]): Promise<any> {
  return new Promise(async (resolve, reject) => {
    if (!lidFile) reject('No lid file found');

    // Absolute path of the LID file
    const lidFileName: string = lidFile[0].fsPath;

    // The name / absolute location of the Dylan Compiler
    const dylanCompiler: string = os.type() === "Windows_NT" ? 'dylan-compiler-with-tools.exe' : 'dylan-compiler-with-tools'

    // array of arguments to pass to the Compiler
    const buildArgs: Array<string> = os.type() === "Windows_NT" ? ['/build', lidFileName] : ['-build', lidFileName];

    // Announcement
    console.log(`Build project ${lidFile} from ${lidFileName}\n\n`);

    // Run the compiler in a new console and send the output to the local one
    execFile(dylanCompiler, buildArgs, (err: Error, stdout: string, stderr: string) => {
      if (err) { reject(err); }
      else if (stderr) { reject(stderr); }
      else { resolve(stdout); }
    });
  });
}

/**
 * 
 * @param lidFile The Uri of the project LID file 
 */
function invokeProjectExecutable(lidFile: vscode.Uri[]): Promise<any> {
  return new Promise(async (resolve, reject) => {
    // strip the prject name from the lid file
    let projectName: string = await (lidFile[0].path.split(/.*\/(.*)\.lid$/)[1]);
    console.log(projectName);

    // Determine the executable name by host OS
    const executableName: string = os.type() === "Windows_NT"
      ? `${projectName}.exe`
      : `${projectName}`;

    // This assumes the executable is in the default location
    const executableLocation: string = `${process.env.OPEN_DYLAN_USER_ROOT}\\bin\\${executableName}`;

    // Fail if the executable can't be located
    if (!fs.existsSync(executableLocation)) { reject(`Could not find the executable (${executableLocation})`); }

    // Announcement
    console.log(`About to run ${executableName}\n`);

    // Run the compiler in a new console and send the output to the local one
    execFile(executableLocation, (err: Error, stdout: string, stderr: string) => {
      if (err) { reject(err); }
      else if (stderr) { reject(stderr); }
      else { resolve(stdout); }
    });
  });
}

/**
 * The main function: successively find the LID file, build the project, then run the resulting executable
 * @returns 0: Error | 1: Success
 */
export async function makeDylanProject() {
  getLidFile().then(async (name) => {

    const isProjectBuilt: boolean = await invokeBuildTool(name)
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
  }, (err) => {
    console.log(`Error receiving project name in makeDylanProject():\n${err}`);
  });
}
