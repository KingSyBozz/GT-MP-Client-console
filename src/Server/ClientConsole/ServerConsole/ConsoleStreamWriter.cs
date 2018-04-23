using System;
using System.IO;
using GrandTheftMultiplayer.Server.API;
using GrandTheftMultiplayer.Server.Constant;
using SyBozz.GrandTheftMultiplayer.Server.ClientConsole.Console;

namespace SyBozz.GrandTheftMultiplayer.Server.ClientConsole.ServerConsole
{
    internal class ConsoleStreamWriter : StreamWriter
    {
        public ConsoleStreamWriter(Stream stream) : base(stream) { }

        public override void WriteLine(string str)
        {
            Output(str);
            base.WriteLine(str);
        }

        public override void Write(string str)
        {
            Output(str);
            base.WriteLine(str);
        }

        private static void Output(string msg)
        {
            if (ConAPI.ServerConsoleReciver.Count <= 0) return;
            var category = LogCat.Info;

            if (msg.Split(' ').Length > 3)
            {
                if (!int.TryParse(msg.Split(' ')[3], out int _))
                {
                    try
                    {
                        category = (LogCat)Enum.Parse(typeof(LogCat), msg.Split(' ')[3]);
                    }
                    catch
                    {
                        // ignored
                    }
                }
            }

            if (msg.Split(' ').Length > 2)
            {
                if (!int.TryParse(msg.Split(' ')[2], out int _))
                {
                    try
                    {
                        category = (LogCat)Enum.Parse(typeof(LogCat), msg.Split(' ')[2]);
                    }
                    catch
                    {
                        // ignored
                    }
                }
            }

            var format = ConsoleHandler.LogCatToString(category);
            ConAPI.ServerConsoleReciver.ForEach(player => API.shared.triggerClientEvent(player, "console_client_server_msg_output", format.Prefix, msg, format.Color));
        }

    }
}
