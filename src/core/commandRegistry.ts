import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import type { JuanitaClient } from "../client.js";
import type { JuanitaCommand } from "../commands/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function registerCommands(client: JuanitaClient) {
  const commandsDir = join(__dirname, "..", "commands");
  const files = readdirSync(commandsDir).filter(
    (f) => (f.endsWith(".ts") || f.endsWith(".js")) && !f.endsWith(".d.ts") && !f.startsWith("types."),
  );

  const commandData: JuanitaCommand[] = [];

  for (const file of files) {
    const mod = await import(join(commandsDir, file));
    const command: JuanitaCommand = mod.default;
    if (command.name && command.description) {
      client.commands.set(command.name, command);
      commandData.push(command);
      console.log(`[Command] Loaded: ${command.name}`);
    }
  }

  return commandData;
}
