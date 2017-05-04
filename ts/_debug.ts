import { nullConsole } from "./console"
import { detectNodeJs } from "./_test_node"

export let _console :Console = nullConsole
export function debugOn(prConsole? :Console) {
  _console = prConsole ? prConsole : console;

  // For node JS we create dummy functions for unknown methods of std Console
  if (! prConsole && detectNodeJs()) {
    _console.group = function() {}
    _console.groupEnd = function() {}
  }
}
