import * as fs from 'fs';
import * as os from 'os';
import { execFile } from 'child_process';

async function invokeBuildTool(lidFileName: string):Promise<any> {
  let promise = new Promise(async (resolve, reject) => {
    execFile('dylan-compiler-with-tools.exe', ['/build', lidFileName], (err: Error, stdout: string, stderr: string) => {
      if (err) { reject(err); }
      else if (stderr) { reject(stderr); }
      else { resolve(stdout); }
    });
  });
  return promise;
}

export function makeDylanProject(projectName: string) {
  // Check the OS type. 
  // If the OS is not Windows, we are not prepared to handle it.
  if (os.type() !== "Windows_NT") { console.log('Not Windows.'); return; }

  // Set variables 
  const lidFileName: string = `${projectName}.lid`;
  const executableName: string = `${projectName}.exe`;
  const executableLocation: string = `${process.env.OPEN_DYLAN_USER_ROOT}/bin/${executableName}`;

  // Announce 
  console.log(`Build project ${projectName} from ${lidFileName}\n`);

  // Invoke build tool
  invokeBuildTool(lidFileName).then(data => console.log(data));
}
