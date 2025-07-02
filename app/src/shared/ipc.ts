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

/** ------------------------------------------------------------------------- */

export default IPC;