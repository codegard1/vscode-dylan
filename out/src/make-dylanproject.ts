import * as fs from 'fs';
import * as os from 'os';
import { execFile } from 'child_process';
import vscode = require('vscode');

/**
 * 
 * @param projectName Name of the project to build. 
 */
async function invokeBuildTool(projectName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Get the lid file 
    const lidFileName: string = `${projectName}.lid`;
    fs.exists(lidFileName, doesExist => {
      if (doesExist) {
        console.log(`LID file does exist`);
      } else {
        reject(`Error: Could not find the LID file (${lidFileName})`);
      }
    });

    // The name / absolute location of the Dylan Compiler
    const dylanCompiler = os.type() === "Windows_NT" ? 'dylan-compiler-with-tools.exe' : 'dylan-compiler-with-tools'
    // array of arguments to pass to the Compiler
    const buildArgs = os.type() === "Windows_NT" ? ['/build', lidFileName] : ['-build', lidFileName];

    // Announcement
    console.log(`Build project ${projectName} from ${lidFileName}\n`);

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
 * @param projectName 
 */
async function invokeProjectExecutable(projectName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const executableName: string = os.type() === "Windows_NT"
      ? `${projectName}.exe`
      : `${projectName}`;
    const executableLocation: string = `${process.env.OPEN_DYLAN_USER_ROOT}\\bin\\${executableName}`;

    if (fs.existsSync(executableLocation)) {
      console.log(`${executableLocation} does exist.`);
    } else {
      reject(`Could not find the executable (${executableLocation})`);
    }

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

export function makeDylanProject(projectName: string) {
  // Start the process
  invokeBuildTool(projectName)
    .then(data => {
      console.log(data);
    }, error => {
      console.error(`Error during invokeBuildTool: \n ${error}`);
    })
    .then(() => {
      return invokeProjectExecutable(projectName);
    }).then(data => {
      console.log(data);
      return 0;
    })
    .catch(data => {
      console.error(`Error during invokeBuildTool: \n ${data}`);
    })
}
