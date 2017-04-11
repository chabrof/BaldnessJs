import { nullConsole } from "BaldnessJs/console"

export let _console :Console = nullConsole
export function debugOn(prConsole? :Console) {
  _console = prConsole ? prConsole : console;
}
