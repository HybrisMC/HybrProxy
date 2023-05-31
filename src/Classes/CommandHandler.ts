import PlayerProxyHandler from '../player/PlayerProxyHandler';
import { emotes } from '../Types';
import Command from './Command';
import Logger from './Logger';

export default class CommandHandler {
  public commands: Command[];
  public commandsList: string[];

  public constructor(proxyHandler: PlayerProxyHandler) {
    this.commands = [];
    this.commandsList = [];

    proxyHandler.on('fromClient', ({ data, name }, toClient, toServer) => {
      if (name === 'chat') {
        const message = data.message.toLowerCase().split(' ')[0];
        if (!this.commandsList.includes(message)) {
          const origMessage = data.message;
          let newMessage = data.message;

          for (const syntax in emotes)
            if (Object.prototype.hasOwnProperty.call(emotes, syntax))
              newMessage = newMessage.replaceAll(syntax, emotes[syntax]);

          if (newMessage === origMessage) return true;
          else {
            toServer.write(name, {
              ...data,
              message: newMessage,
            });
            return false;
          }
        }

        const commandS = message.replace('/', '');
        const command = this.commands.find(
          (command) =>
            command.name === commandS || command.aliases.includes(commandS)
        );

        const args: string[] = (data.message as string).split(' ');
        args.shift();
        if (!command.validateSyntax(message, args)) {
          command.player.sendMessage(command.getSyntaxMessage());
          return false;
        }

        if (command)
          command.onTriggered(message, args, () =>
            proxyHandler.player.server.write(name, data)
          );
        else Logger.warn(`Command ${message} not found`);

        return false;
      }
    });
  }

  public registerCommand(...commands: Command[]): CommandHandler {
    this.commands = this.commands.concat(commands);
    this.commandsList = this.commandsList.concat(
      ...commands.map((c) => [`/${c.name}`, ...c.aliases.map((a) => `/${a}`)])
    );

    return this;
  }

  public removeCommand(command: Command): void {
    this.commands = this.commands.filter((c) => c !== command);
  }
}
