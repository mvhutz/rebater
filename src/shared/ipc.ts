import { createInterprocess } from "interprocess";

/** ------------------------------------------------------------------------- */

const IPC = createInterprocess({
  main: {
    async getPing(_, data: 'ping') {
      const message = `from renderer: ${data} on main process`

      console.log(message)

      return message
    },
  },

  renderer: {
    async getPong(_, data: 'pong') {
      const message = `from main: ${data} on renderer process`

      console.log(message)

      return message
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