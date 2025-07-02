import { dialog } from "electron";
import { createInterprocess } from "interprocess";

/** ------------------------------------------------------------------------- */

const IPC = createInterprocess({
  main: {
    async getPing() {
      const message = "PONG!";
      console.log("PING!");
      return message;
    },
    async chooseDir() {
      const directory = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });

      return directory.filePaths;
    },
  },
});

// async function main() {
//   const time = { quarter: 4, year: 2024 } satisfies Time;
//   const settings = new BasicSettings("./data");
//   const state = new BasicState(time, settings);
//   const runner = new CLIRunner();

//   runner.run(state);
// }


/** ------------------------------------------------------------------------- */

export default IPC;