using System.IO;
using GrandTheftMultiplayer.Server.API;

namespace SyBozz.GrandTheftMultiplayer.Server.ClientConsole.ServerConsole
{
	internal class Main : Script
	{
		private TextWriter _old;
		private ConsoleStreamWriter _sw;

		public Main()
		{
			API.onResourceStart += OnResourceStartHandler;
			API.onResourceStop += OnResourceStopHandler;
		}

		private void OnResourceStopHandler()
		{
			_sw.Close();
			System.Console.SetOut(_old);
		}

		private void OnResourceStartHandler()
		{
			_old = System.Console.Out;
            _sw = new ConsoleStreamWriter(System.Console.OpenStandardOutput())
            {
                AutoFlush = true
            };
            System.Console.SetOut(_sw);

		#if DEBUG
			API.consoleOutput($"[DEBUG] Client console v{System.Reflection.Assembly.GetExecutingAssembly().GetName().Version}");
		#else
			API.consoleOutput($"Client console v{System.Reflection.Assembly.GetExecutingAssembly().GetName().Version}");
		#endif
		}

	}
}
