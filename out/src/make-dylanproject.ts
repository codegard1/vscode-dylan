import * as fs from 'fs';
import * as os from 'os';
import { execFile } from 'child_process';
import vscode = require('vscode');
import * as path from 'path';

/**
 * 
 * @param startPath The path in which to search. Default is the current directory 
 * (i.e. the project directory)
 * @param filter Regular Expression identifying which type of file to search for. 
 * Default is .lid
 */
function getProjectName(startPath: string = '.', filter: RegExp = /\.lid$/): string {
  // console.log('Starting from dir ' + startPath + '/');
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return null;
  }

  const files: Array<string> = fs.readdirSync(startPath);
  let results: Array<string> = [];
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
  };

  // Return the first lid file found or nothing
  return results.length > 0 ? results[0].split('.')[0] : '';
};

/**
 * 
 * @param projectName Name of the project to build. 
 */
async function invokeBuildTool(projectName: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    if (!projectName) reject('No lid file found');

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
    const dylanCompiler: string = os.type() === "Windows_NT" ? 'dylan-compiler-with-tools.exe' : 'dylan-compiler-with-tools'
    // array of arguments to pass to the Compiler
    const buildArgs: Array<string> = os.type() === "Windows_NT" ? ['/build', lidFileName] : ['-build', lidFileName];

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
function invokeProjectExecutable(projectName: string): Promise<any> {
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

export async function makeDylanProject(projectName: string = getProjectName()) {

  await invokeBuildTool(projectName)
    .then(data => {
      console.log(data);
    }, error => {
      console.error(`Error during invokeBuildTool: \n ${error}`);
    });

  await invokeProjectExecutable(projectName)
    .then(data => {
      console.log(data);
      return 0;
    })
    .catch(data => {
      console.error(`Error during invokeProjectExecutable: \n ${data}`);
    });
}

makeDylanProject(); //testing