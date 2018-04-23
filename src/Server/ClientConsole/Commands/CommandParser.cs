using System;
using System.Collections.Generic;
using System.Reflection;
using GrandTheftMultiplayer.Server.API;
using GrandTheftMultiplayer.Server.Constant;
using GrandTheftMultiplayer.Server.Elements;
using GrandTheftMultiplayer.Server.Managers;
using SyBozz.GrandTheftMultiplayer.Server.ClientConsole.Console;

namespace SyBozz.GrandTheftMultiplayer.Server.ClientConsole.Commands
{
    internal class CommandParser
    {
        internal static Dictionary<string, CommandInfo> commandInfos = new Dictionary<string, CommandInfo>();

        private static object GetGameServer()
        {
            var assembly = Assembly.GetEntryAssembly();
            var assemblyType = assembly.GetType("GrandTheftMultiplayer.Server.Program");
            if (assemblyType == null) return null;
            var serverInstanceProperty = assemblyType.GetProperty("ServerInstance", (BindingFlags)0xFFFF);
            return serverInstanceProperty?.GetValue(null);
        }

        private static object GetCommandHandler()
        {
            var gameServer = GetGameServer();
            var field = gameServer?.GetType().GetField("CommandHandler");
            return field?.GetValue(gameServer);
        }
        
        private static bool TryParseCommand(string argumentsString)
        {
            if (string.IsNullOrWhiteSpace(argumentsString))
                return true;
            var argumentsArray = argumentsString.Split(' ');
            var commandParameters = CommandHandler.commandList.GetCommandInfo(argumentsArray[0]).Parameters;
            for (var i = 1; i < commandParameters.Length; i++)
            {
                if (commandParameters[i].IsOptional)
                {
                    if ((argumentsArray.Length - 1) < i)
                        continue;
                    if (string.IsNullOrWhiteSpace(argumentsArray[i]))
                        continue;
                }
                foreach (var baseType in commandParameters[i].ParameterType.Assembly.GetTypes())
                {
                    if (baseType != typeof(IConvertible)) continue;
                    // ReSharper disable once ReturnValueOfPureMethodIsNotUsed
                    try { Convert.ChangeType(argumentsArray[i], commandParameters[i].ParameterType); }
                    catch { return false; }
                }
                if (!commandParameters[i].ParameterType.IsEnum) continue;
                // ReSharper disable once ReturnValueOfPureMethodIsNotUsed
                try	{ Enum.Parse(commandParameters[i].ParameterType, argumentsArray[i]); }
                catch { return false; }
            }
            return true;
        }
        

        internal static bool ExecuteCommand(Client player, string arguments)
        {
            if (string.IsNullOrWhiteSpace(arguments))
                return false;
            var command = arguments.Split(' ')[0];
            if (!CommandHandler.commandList.DoesCommandExist(command)) return false;
            if (API.shared.isAclEnabled())
            {
                if (!API.shared.doesPlayerHaveAccessToCommand(player, command))
                {
                    player.ClientConsoleOutput(LogCat.Error, "You don't have have access to this command!");
                    return false;
                }
            }
            else
            {
                if (CommandHandler.commandList.IsAclRequired(command))
                {
                    player.ClientConsoleOutput(LogCat.Error, "ACL must be running.");
                    return false;
                }
            }
            if (TryParseCommand(arguments))
            {
                if (!ConAPI.ChatCommandEvent(player, arguments)) return false;
                var commandHandler = GetCommandHandler();
                var parseMethod = commandHandler.GetType().GetMethod("Parse");
                return parseMethod != null && (bool)parseMethod.Invoke(commandHandler, new object[] { player, arguments });
            }
            ConsoleHandler.ClientConsolePrintCmdError(player, command);
            return false;
        }

    }
}
