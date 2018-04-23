using System.Collections.Generic;
using GrandTheftMultiplayer.Server.API;
using GrandTheftMultiplayer.Server.Constant;
using GrandTheftMultiplayer.Server.Elements;
using SyBozz.GrandTheftMultiplayer.Server.ClientConsole.Commands;

namespace SyBozz.GrandTheftMultiplayer.Server.ClientConsole.Console
{
    internal class ConsoleHandler : Script
    {
        internal static Dictionary<Client, bool> enabledConsoleForClient = new Dictionary<Client, bool>();
        internal static bool enableConsole = true;

        public ConsoleHandler()
        {
            API.onClientEventTrigger += OnClientEventTriggerHandler;
        }

        private static void OnClientEventTriggerHandler(Client player, string eventName, object[] args)
        {
            switch (eventName)
            {
                case "console_client_function_executeCommand":
                    CommandParser.ExecuteCommand(player, (string)args[0]);
                    break;
                case "console_client_function_enabledConsole":
                    if (enabledConsoleForClient.ContainsKey(player))
                        enabledConsoleForClient[player] = (bool)args[0];
                    else
                        enabledConsoleForClient.Add(player, (bool)args[0]);
                    break;
            }
        }

        internal static void ClientConsolePrintCmdError(Client player, string command)
        {
            API.shared.triggerClientEvent(player, "console_client_function_printCmdError", command);
        }

        internal static MessageFormat LogCatToString(LogCat category)
        {
            switch (category)
            {
                case LogCat.Info:
                    return new MessageFormat("~b~INFO", "~w~");
                case LogCat.Warn:
                    return new MessageFormat("~p~WARN", "~p~");
                case LogCat.Error:
                    return new MessageFormat("~y~ERROR", "~y~");
                case LogCat.Debug:
                    return new MessageFormat("~c~DEBUG", "~c~");
                case LogCat.Trace:
                    return new MessageFormat("~c~TRACE", "~c~");
                case LogCat.Fatal:
                    return new MessageFormat("~r~FATAL", "~r~");
                default:
                    return new MessageFormat("~b~INFO", "~w~");
            }
        }
    }

    internal class MessageFormat
    {
        public string Prefix;
        public string Color;

        public MessageFormat(string prefix, string color)
        {
            Prefix = prefix;
            Color = color;
        }
    }
}
