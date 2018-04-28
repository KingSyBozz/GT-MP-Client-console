using GrandTheftMultiplayer.Server.API;
using GrandTheftMultiplayer.Server.Elements;
using SyBozz.GrandTheftMultiplayer.Server.ClientConsole.Console;

namespace SyBozz.GrandTheftMultiplayer.Server.ClientConsole.Commands
{
    internal class CommandHandler : Script
    {

        private static string _thisResourceName;
        internal static CommandList commandList = new CommandList();

        public CommandHandler()
        {
            API.onResourceStart += OnResourceStartHandler;
            API.onServerResourceStart += OnServerResourceStartHandler;
            API.onServerResourceStop += OnServerResourceStopHandler;
            API.onPlayerConnected += OnPlayerConnectedOrFinishedDownloadHandler;
            API.onPlayerFinishedDownload += OnPlayerConnectedOrFinishedDownloadHandler;

        }

        private void OnResourceStartHandler()
        {
            _thisResourceName = API.getThisResource();
            foreach(var resourceName in API.shared.getRunningResources())
            {
                var commands = API.getResourceCommandInfos(resourceName);
                commandList.Add(resourceName, commands);
            }
            API.triggerClientEventForAll("console_client_function_registerCommands", commandList.GetAllCommands);
        }

        private void OnServerResourceStartHandler(string resourceName)
        {
            if (resourceName == _thisResourceName) return;
            var commands = API.getResourceCommandInfos(resourceName);
            commandList.Add(resourceName, commands);
            API.triggerClientEventForAll("console_client_function_registerCommands", commandList.GetAllCommands);
        }

        private void OnServerResourceStopHandler(string resourceName)
        {
            if (resourceName == _thisResourceName) return;
            commandList.Remove(resourceName);
            API.triggerClientEventForAll("console_client_function_registerCommands", commandList.GetAllCommands);
        }

        private void OnPlayerConnectedOrFinishedDownloadHandler(Client player)
        {
            API.triggerClientEvent(player, "console_client_function_registerCommands", commandList.GetAllCommands);
            API.triggerClientEvent(player, "console_client_function_enableConsole", ConsoleHandler.enableConsole);
            var cmdErrormsg = CommandParser.GetCommandErrorMessage();
            if (cmdErrormsg != null && CommandParser.commandErrorMessage != cmdErrormsg)
                CommandParser.commandErrorMessage = cmdErrormsg;
            API.triggerClientEvent(player, "console_client_function_commandError", CommandParser.commandErrorMessage);
        }

    }
}
