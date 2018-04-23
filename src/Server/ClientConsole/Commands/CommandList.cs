using System.Collections.Generic;
using System.Linq;
using GrandTheftMultiplayer.Server.API;
using GrandTheftMultiplayer.Server.Constant;
using GrandTheftMultiplayer.Server.Managers;
using Newtonsoft.Json;

namespace SyBozz.GrandTheftMultiplayer.Server.ClientConsole.Commands
{
	internal class CommandList
	{
		private readonly Dictionary<string, CommandInfo[]> _resources = new Dictionary<string, CommandInfo[]>();

	    public List<string> GetAllCommands { get; private set; } = new List<string>();

	    public void Add(string resource, CommandInfo[] newCommandInfos)
		{
		    if (_resources.ContainsKey(resource)) return;
		    var commandList = new List<CommandInfo>();
		    var newCommandInfoByGroup = newCommandInfos
		        .GroupBy(x => new {x.Command})
		        .Select(group => new { group.Key.Command, Count = group.Count()});
		    foreach (var groups in newCommandInfoByGroup)
		    {
		        if (groups.Count > 1)
		        {
		            API.shared.consoleOutput(LogCat.Warn, $"Command \"{groups.Command}\" exist {groups.Count} times in the resource \"{resource}\"");
		        }
		    }
            foreach (var newCommand in newCommandInfos)
		    {
		        commandList.Add(newCommand);
		        foreach (var commandInfos in _resources)
		        {
		            foreach (var command in commandInfos.Value)
		            {
		                if (newCommand.Command != command.Command) continue;
		                var cmdMemberDeclaringType = command.Parameters[0].Member.DeclaringType;
		                var newcmdMemberDeclaringType = newCommand.Parameters[0].Member.DeclaringType;

		                if (cmdMemberDeclaringType != null && newcmdMemberDeclaringType != null)
		                    API.shared.consoleOutput(LogCat.Warn, "Command \"{0}\" exsist in resource \"{1}\" in class \"{2}\" and in resource \"{3}\" in class \"{4}\"",
		                        newCommand.Command, commandInfos.Key, cmdMemberDeclaringType.FullName, resource,
		                        newcmdMemberDeclaringType.FullName);
		                if (commandList.Contains(newCommand))
		                    commandList.Remove(newCommand);
		            }
		        }
		    }
		    var newCommands = commandList.ToArray();
		    _resources.Add(resource, newCommands);
		    GetAllCommands = RefreshAllCommands();
		}

		public void Remove(string resource)
		{
		    if (!_resources.ContainsKey(resource)) return;
		    _resources.Remove(resource);
		    GetAllCommands = RefreshAllCommands();
		}

		public bool DoesCommandExist(string command)
		{
		    return _resources.Values.SelectMany(commandInfos => commandInfos).Any(commandInfo => commandInfo.Command == command);
		}

		public bool IsAclRequired(string command)
		{
			var commandInfo = GetCommandInfo(command);
			return command == commandInfo.Command && commandInfo.ACLRequired;
		}

		public CommandInfo GetCommandInfo(string command)
		{
			foreach (var commandInfos in _resources.Values)
			{
				foreach (var commandInfo in commandInfos)
				{
					if (commandInfo.Command == command) return commandInfo;
				}
			}
			return new CommandInfo();
		}

		private List<string> RefreshAllCommands()
		{
		    return (from commandInfos in _resources.Values
		        from commandInfo in commandInfos
		        select JsonConvert.SerializeObject(new CommandData
		        {
		            Command = commandInfo.Command,
		            CustomUsage = (!string.IsNullOrEmpty(commandInfo.CustomUsage)) ? commandInfo.CustomUsage : "",
		            Usage = commandInfo.Usage,
		            Aliases = commandInfo.Aliases,
		            Description = (!string.IsNullOrEmpty(commandInfo.Description)) ? commandInfo.Description : "",
		            GreedyArg = commandInfo.Greedy,
		            SensitiveInfo = commandInfo.Sensitive
		        })).ToList();
		}

	}

	internal class CommandData
	{
		public string Command;
		public string CustomUsage;
		public string Usage;
		public string[] Aliases;
		public string Description;
	    public bool GreedyArg;
	    public bool SensitiveInfo;
	}
}
