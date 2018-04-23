using GrandTheftMultiplayer.Server.API;
using GrandTheftMultiplayer.Server.Constant;
using GrandTheftMultiplayer.Server.Elements;
using SyBozz.GrandTheftMultiplayer.Server.ClientConsole.Console;
using System.Collections.Generic;

namespace SyBozz.GrandTheftMultiplayer.Server.ClientConsole
{
    // ReSharper disable once InconsistentNaming
    public static class ConAPI
	{
		public delegate void CommandEvent(Client sender, string command, CancelEventArgs cancel);
		public static event CommandEvent OnChatCommand;

		/// <summary>
		/// All clients who can read the server console output ingame.
		/// </summary>
		public static readonly List<Client> ServerConsoleReciver = new List<Client>();

        /// <summary>
        /// If the client console is enabled for all players.
        /// </summary>
        /// <returns>True if enabled.</returns>
	    public static bool IsClientConsoleEnabledForAll()
	    {
	        return ConsoleHandler.enableConsole;
	    }

        /// <summary>
        /// Enable the client console for all players.
        /// </summary>
        /// <param name="enabled">If true the client console is enabled for all player.</param>
	    public static void SetClientConsoleEnabledForAll(bool enabled)
	    {
	        ConsoleHandler.enableConsole = enabled;
	        API.shared.triggerClientEventForAll("console_client_function_enableConsole", ConsoleHandler.enableConsole);
        }

        /// <summary>
        /// If the client console enabled for the given player.
        /// </summary>
        /// <param name="player"></param>
        /// <returns>True if enabled.</returns>
	    public static bool IsClientConsoleEnabled(Client player)
	    {
	        if (ConsoleHandler.enabledConsoleForClient.ContainsKey(player))
	            return ConsoleHandler.enabledConsoleForClient[player];

	        ConsoleHandler.enabledConsoleForClient.Add(player, ConsoleHandler.enableConsole);
	        return ConsoleHandler.enabledConsoleForClient[player];
        }

        /// <summary>
        /// Enable the client conaole for the given player.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="enabled">If true the client console is enabled for the given player.</param>
	    public static void SetClientConsoleEnabled(Client player, bool enabled)
	    {
	        if (!ConsoleHandler.enabledConsoleForClient.ContainsKey(player))
                ConsoleHandler.enabledConsoleForClient.Add(player, enabled);

            API.shared.triggerClientEvent(player, "console_client_function_enableConsole", enabled);
        }

        /// <summary>
        /// Send a message to all players client console.
        /// </summary>
        /// <param name="text"></param>
		public static void ClientConsoleOutputToAll(string text)
		{
		    API.shared.triggerClientEventForAll("console_client_server_msg_output", "~b~SERVER", text, "~w~");
        }

        /// <summary>
        /// Send a message to the given players client console.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="text"></param>
		public static void ClientConsoleOutput(Client player, string text)
		{
			ClientConsoleOutput(player, LogCat.Info, text);
		}

        /// <summary>
        /// Send a message to the given players client console.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="text"></param>
        /// <param name="args"></param>
		public static void ClientConsoleOutput(Client player, string text, params object[] args)
		{
			ClientConsoleOutput(player, LogCat.Info, text, args);
		}

        /// <summary>
        /// Send a message to the given players client console.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="category"></param>
        /// <param name="text"></param>
        /// <param name="args"></param>
		public static void ClientConsoleOutput(Client player, LogCat category, string text, params object[] args)
		{
			var textFormat = string.Format(text, args);
			var format = ConsoleHandler.LogCatToString(category);

		    API.shared.triggerClientEvent(player, "console_client_server_msg_output", format.Prefix, textFormat, format.Color);
        }

		internal static bool ChatCommandEvent(Client sender, string command)
		{
			var args = new CancelEventArgs(false);
			OnChatCommand?.Invoke(sender, $"/{command}", args);

			return !args.Cancel;
		}

	}
}
