using GrandTheftMultiplayer.Server.Constant;
using GrandTheftMultiplayer.Server.Elements;

namespace SyBozz.GrandTheftMultiplayer.Server.ClientConsole
{
    public static class Extensions
	{

        /// <summary>
        /// Send a message to the given players client console.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="text"></param>
		public static void ClientConsoleOutput(this Client player, string text)
		{
			ConAPI.ClientConsoleOutput(player, text);
		}

        /// <summary>
        /// Send a message to the given players client console.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="text"></param>
        /// <param name="args"></param>
		public static void ClientConsoleOutput(this Client player, string text, params object[] args)
		{
			ConAPI.ClientConsoleOutput(player, text, args);
		}

        /// <summary>
        /// Send a message to the given players client console.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="category"></param>
        /// <param name="text"></param>
        /// <param name="args"></param>
		public static void ClientConsoleOutput(this Client player, LogCat category, string text, params object[] args)
		{
			ConAPI.ClientConsoleOutput(player, category, text, args);
		}

        /// <summary>
        /// Enable the client conaole for the given player.
        /// </summary>
        /// <param name="player"></param>
        /// <param name="enabled">If true the client console is enabled for the given player.</param>
	    public static void SetClientConsoleEnabled(this Client player, bool enabled)
	    {
	        ConAPI.SetClientConsoleEnabled(player, enabled);
	    }

        /// <summary>
        /// If the client console enabled for the given player.
        /// </summary>
        /// <param name="player"></param>
        /// <returns>True if enabled.</returns>
	    public static bool IsClientConsoleEnabled(this Client player)
	    {
	        return ConAPI.IsClientConsoleEnabled(player);
	    }

	}
}
