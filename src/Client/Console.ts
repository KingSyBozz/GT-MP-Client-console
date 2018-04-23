/// <reference path="Console.d.ts" />

let screenRes = API.getScreenResolutionMaintainRatio();
const maxStringLength: number = 99;
let cConsole: ClientConsole;

class ClientConsole {

	get visible(): boolean { return this._visible; }
	set visible(value: boolean) { this._visible = value; this._page = 1; this.clearInput(); API.setCanOpenChat(!value); API.setChatVisible(!value); }

	private _visible: boolean = false;
	private _height: number = screenRes.Height / 4;
	private _scale: number = 0.25;
	private _inputHeight: number = 25;
	private _page: number = 1;
	private _input: string = "";
	private _lines: System.Collections.Generic.List<string> = new List(String);
	private _cursorPos: number = 0;
	private _date: number = 0;

	private _commands: any[] = [];
	private _commandList: System.Collections.Generic.List<string> = new List(String);

	private _commandHistory: System.Collections.Generic.List<string> = new List(String);
	private _commandPos = -1;

	private _lastServerCommands: System.Collections.Generic.List<string> = new List(String);

	constructor() {
		if (cConsole) {
			cConsole.visible = false;
			cConsole = null;
		}
		cConsole = this;

		this.info("~g~--- GT-MP ingame console ---");
        this.info(`~g~--- Type "${ConsoleConfig.helpCommand}" to print an overview of available commands ---`);

		this.consoleCommands();
	}

	private consoleCommands(): void {
        this.registerCommand(ConsoleConfig.helpCommand, "", " [command?]", [], `Use "${ConsoleConfig.helpCommand} [command?]" for more information.`, false, false, (cmd) => this.printHelp(cmd));
        this.registerCommand(ConsoleConfig.clearCommand, "", "", [], `Use "${ConsoleConfig.clearCommand}" to clear the console.`, false, false, () => this.clearConsole());
        this.registerCommand(ConsoleConfig.exitCommand, "", "", [], `Use "${ConsoleConfig.exitCommand}" to close the console.`, false, false, () => cConsole.visible = false);
	}

    private registerCommand(cmd: string, customUsage: string, usage: string, aliases: string[], description: string, greedyArgs: boolean, sensitive: boolean, commandFunction: (cmd: string) => void = (cmd) => this.executeCommand(cmd)): void {
		var argsUsage = (customUsage) ? customUsage : `Usage: "${cmd}${(usage) ? usage + "\"" : "\""}`;
		var argsArray = this.splitArguments(usage);
		var argsMax = (usage) ? argsArray.length : 0;
		var argsMin = argsMax;
        if (usage.match(/\?/g) != null) argsMin = argsMax - ((usage) ? usage.match(/\?/g).length : 0);
	    if (greedyArgs) argsMax = -1;
		var command = [cmd, argsUsage, argsMin, argsMax, aliases, description, commandFunction, sensitive];
		this._commands.push(command);
		this._commandList.Add(cmd);
	}

	private unregisterCommand(cmd: string): void {
		if (this._commandList.Contains(cmd)) {
			this._commandList.Remove(cmd);
			for (var i = 0; i < this._commands.length; i++) {
				if (this._commands[i][0] === cmd) this._commands[i] = null;
			}
		}
	}	

	private splitArguments(args: string): string[] {
		if (args.length === 0) return [];
		var argsSplit = args.split(" ");
		var argsArray = [];
		for (var i = 0; i < argsSplit.length; i++) if (argsSplit[i]) argsArray.push(argsSplit[i]);
		return argsArray;
	}

	private getCommandInfos(command: string): any[] {
		if (this._commandList.Contains(command)) {
			for (var i = 0; i < this._commands.length; i++) {
				if (this._commands[i][0] === command) return this._commands[i];
			}
		}
		return null;
	}

	private parseCommand(command: string): void {
		if (command.length > 0) {
			let cmd = command.split(" ")[0];
			let args = command.substring(cmd.length + 1);
			let argsSplit = this.splitArguments(args);
			let cmdInfo = this.getCommandInfos(cmd);
            if (cmdInfo) {
                if (argsSplit.length >= cmdInfo[2] && cmdInfo[3] === -1) { // Checking for greedy args
                    cmdInfo[6](command);
                }
				else if (argsSplit.length >= cmdInfo[2] && argsSplit.length <= cmdInfo[3]) {
					cmdInfo[6](command);
				}
				else this.error(cmdInfo[1]);
			}
            else
                this.wrongCommand(cmd);
		}
	}

	private executeCommand(command: string): void {
		API.triggerServerEvent("console_client_function_executeCommand", command);
	}

	private clearConsole(): void {
		this._lines = new List(String);
		this.info("~g~--- GT-MP ingame console ---");
        this.info(`~g~--- Type "${ConsoleConfig.helpCommand}" to print an overview of available commands ---`);
	}

	private clearInput(): void {
		this._input = "";
		this._cursorPos = 0;
	}

	private printHelpList(command: string): void {
        this.info("--- Help ---");
        this.info("Use Page-Up and Page-Down to change the page.");
        this.info("Use Tab for autocomplete.");
		this.info(`Use "${command} [command?]" for more information.`);
		var cmds = "";
		var iCount = 1;
		for (var i = 0; i < this._commandList.Count; i++) {
			cmds += this._commandList[i];
			if (i < this._commandList.Count - 1) cmds += ", ";
			if (iCount >= 5) {
				cmds += "\n";
				iCount = 0;
			}
			iCount++;
		}
		this.info(`Commands: ${cmds.toString()}`);
		this.info("---");
	}

	private addLines(prefix: string, msg: string[], color: string = "~w~"): void {
		for (var i = 0; i < msg.length; i++) {
			var date = new Date();
			var dateNow = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
			var str = `~c~[${dateNow}] ~w~[${prefix}~w~] ${color}${msg[i]}`;
            this._lines.Add(str);
		    this._page = 1;
		}
	}

	private printHelp(command: string): void {
		let cmd = command.split(" ")[0];
		let args = this.splitArguments(command.substring(cmd.length + 1));
		if (args.length > 0) {
			this.printHelpForCmd(args[0]);
		}
		else {
			this.printHelpList(cmd);
        }
	}

	private printHelpForCmd(cmd: string): void {
		if (this._commandList.Contains(cmd)) {
			var cmdInfos = this.getCommandInfos(cmd);
			if (cmdInfos[5]) {
				this.info(`${cmdInfos[1]}. ${cmdInfos[5]}`);
			}
			else this.info(cmdInfos[1]);
		}
        else
            this.wrongCommand(cmd);
    }

    private wrongCommand(cmd: string) {
        this.error(`Can't find the command "${cmd}". Type "${ConsoleConfig.helpCommand}" to print an overview of available commands`);
    }

	// Console functions

	private handleServerCommands(commands: string): void {
		try {
			var cmd = JSON.parse(commands);
            this.registerCommand(cmd["Command"], cmd["CustomUsage"], cmd["Usage"], cmd["Aliases"], cmd["Description"], cmd["GreedyArg"], cmd["SensitiveInfo"]);
		}
		catch (err) {
			this.error(err.message);
		}
	}

	public consoleCommandChanged(): void {
		this.registerServerCommands(this._lastServerCommands);
	}

	public registerServerCommands(commands: System.Collections.Generic.List<string>): void {
		try {
            // ReSharper disable once WrongExpressionStatement
		    commands.Count;
		} catch (err) {
		     this.error(err.message); return;
		}
		this._lastServerCommands = commands;
		this._commandList = new List(String);
		this._commands = [];
		this.consoleCommands();
		for (var i = 0; i < commands.Count; i++) {
			this.handleServerCommands(commands[i]);
		}
	}

	public draw() {
		if (this._visible && !API.isChatOpen()) {

			API.disableAllControlsThisFrame();
			API.drawRectangle(0, 0, screenRes.Width, this._height, 0, 0, 0, 175);
			API.drawRectangle(0, this._height, screenRes.Width, this._inputHeight, 0, 0, 0, 200);
			API.drawRectangle(0, this._height + this._inputHeight, 80, 25, 0, 0, 0, 200);

			drawText("$>", 0, this._height, this._scale, 255, 0, 0, 255, 0, 0, false, false, 0);
			drawText(`Page ${this._page}/${(this._lines.Count === 0) ? 0 : Math.ceil(this._lines.Count / 16)}`, 5, this._height + 25, this._scale, 255, 255, 255, 255, 0, 0, false, false, 0);

			let start = (this._page - 1) * 16;
			let end = Math.min(this._lines.Count, this._page * 16 - 1);

			var inputText = this._input;
			var index = inputText.length - this._cursorPos;

			if (API.getGlobalTime() - this._date > 500) {
				inputText = inputText.substring(0, index) + "~r~|~w~" + inputText.substring(index);
			}
			else {
				inputText = inputText.substring(0, index) + " " + inputText.substring(index);
			}

			drawText(inputText, 25, this._height, this._scale, 255, 255, 255, 255, 0, 0, false, false, 0);

			if (API.getGlobalTime() - this._date > 1000) {
				this._date = API.getGlobalTime();
			}

			for (var i = 0; i < this._lines.Count; i++) {
				if (i >= start && i <= end) {
					let index = (this._lines.Count - i) - 1;
					//API.drawText(this._lines[index], 2, (15 - (i % 16)) * 16, this._scale, 255, 255, 255, 255, 0, 0, false, false, 0);
					drawText(this._lines[index], 2, (15 - (i % 16)) * 16, this._scale, 255, 255, 255, 255, 0, 0, false, false, 0);
				}
			}

		}
	}

	public tabAutoComplete() {
		if (this._input.length > 0) {
            var result = this.matching(this._input);
            if (result.length === 0)
                API.playSoundFrontEnd("ERROR", "HUD_FRONTEND_DEFAULT_SOUNDSET");
            else if (result.length === 1)
                this._input = result[0];
			else if (result.length > 1) {
				var matches = [];
				for (var i = 0; i < result.length; i++) {
					var cmd1 = result[i].split("");
					for (var r = 0; r < result.length; r++) {
						if (result[i] === result[r]) continue;
						var cmd2 = result[r].split("");
						var count = (cmd1.length > cmd2.length) ? cmd2.length : cmd1.length;
						var match = 0;
						for (var x = 0; x < count; x++) {
							if (cmd1[x] === cmd2[x]) match++;
						}
						matches.push(match);
					}
				}
				this._input = result[0].substring(0, Math.min.apply(null, matches));
			}
		}
		else API.playSoundFrontEnd("ERROR", "HUD_FRONTEND_DEFAULT_SOUNDSET");
	}

	private matching(input: string): string[] {
		var result = [];
		if (input) {
            for (var i = 0; i < this._commandList.Count; i++) {
                if (this._commandList[i].startsWith(input, 0)) // (as any) prevent error TS2339 (this._commandList[i] as any)
                    result.push(this._commandList[i]);
            }
		}
		return result;
	}

	public moveCursorLeft(): void {
		if (this._cursorPos < this._input.length) {
			this._cursorPos++;
		}
	}

	public moveCursorRight(): void {
		if (this._cursorPos > 0) {
			this._cursorPos--;
		}
	}

	public pageUp(): void {
		this._page = clamp(this._page + 1, 1, Math.ceil(this._lines.Count / 16));
	}

	public pageDown(): void {
		this._page = clamp(this._page - 1, 1, Math.ceil(this._lines.Count / 16));
	}

	public setCursorToEnd(): void {
		this._cursorPos = 0;
	}

	public addInputChar(str: string): void {
		if (str === "~") return;
		if (str.length > 0 && this._input.length <= 45 && typeof str === "string") {
			var input = this._input;
			this._input = input.substring(0, (input.length - this._cursorPos)) + str + input.substring(input.length - this._cursorPos);
			this._commandPos = -1;
		}
	}

	public removeCharLeft(): void {
		if (this._input.length > 0) {
			var input = this._input;
			this._input = input.substring(0, (input.length - this._cursorPos) - 1) + input.substring(input.length - this._cursorPos);
			this._commandPos = -1;
		}
	}

	public removeCharRight(): void {
		if (this._input.length > 0) {
			var input = this._input;
			this._input = input.substring(0, input.length - this._cursorPos) + input.substring((input.length - this._cursorPos) + 1);
			this._commandPos = -1;
		}
		if (this._cursorPos > 0) {
			this._cursorPos--;
		}
	}

	public executeInput(): void {
		if (this._input.length > 0) {
			this._commandPos = -1;
			if (this._commandHistory.Count === 0 || this._commandHistory[this._commandHistory.Count - 1] !== this._input) {
				this._commandHistory.Add(this._input);
			}
			this.parseCommand(this._input);
            this.clearInput();
		}
	}

	public goCommandHistoryUp(): void {
		if (this._commandHistory.Count === 0) {
			return;
		}
		if (this._commandPos >= this._commandHistory.Count - 1) {
			return;
		}
		this._commandPos++;
		this._input = this._commandHistory[this._commandHistory.Count - this._commandPos - 1];
	}

	public goCommandHistoryDown(): void {
		if (this._commandHistory.Count === 0) {
			return;
		}
		if (this._commandPos <= 0) {
			return;
		}
		this._commandPos--;
		this._input = this._commandHistory[this._commandHistory.Count - this._commandPos - 1];
	}

	public printCmdError(cmd: string): void {
		if (this._commandList.Contains(cmd)) {
			var cmdInfos = this.getCommandInfos(cmd);
			this.error(cmdInfos[1]);
		}
	}

	// Console outputs

	public info(msg: string): void {
		this.addLines("~b~INFO", msg.split("\n"));
	}

	public error(msg: string): void {
		this.addLines("~y~ERROR", msg.split("\n"), "~y~");
	}

	public warn(msg: string): void {
		this.addLines("~p~WARN", msg.split("\n"), "~p~");
	}

	public debug(msg: string): void {
		this.addLines("~c~DEBUG", msg.split("\n"), "~c~");
	}

	public fatal(msg: string): void {
		this.addLines("~r~FATAL", msg.split("\n"), "~r~");
	}

    public output(prefix: string, msg: string, color: string = "~w~"): void {
		this.addLines(prefix, msg.split("\n"), color);
	}
}

// ----------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------
function clamp(value: number, min: number, max: number): number {
	return (value < min) ? min : ((value > max) ? max : value);
}

function drawText(caption: string, xPos: number, yPos: number, scale: number, r: number, g: number, b: number, alpha: number, font: number, justify: number, shadow: boolean, outline: boolean, wordWrap: number): void {
	if (caption.length > maxStringLength) {
		let newX = xPos;
		var lastColor = "";
		for (let i = 0; i < caption.length; i += maxStringLength) {
			let str = caption.substr(i, (caption.length - i > maxStringLength) ? maxStringLength : caption.length - i);
			API.drawText(lastColor + str, newX, yPos, scale, r, g, b, alpha, font, justify, shadow, outline, wordWrap);
			lastColor = gatLastColor(caption.substr(0, (caption.length - i > maxStringLength) ? maxStringLength : caption.length - i));
			newX += API.getFontWidth(str, font, scale);
		}
	} else {
		API.drawText(caption, xPos, yPos, scale, r, g, b, alpha, font, justify, shadow, outline, wordWrap);
	}
}

let colors = ["~r~", "~b~", "~g~", "~y~", "~p~", "~q~", "~o~", "~c~", "~m~", "~u~", "~n~", "~s~", "~w~", "~h~"];

function gatLastColor(caption: string): string {
	let index = [];
	for (let i = 0; i < colors.length; i++) {
		var resIndex = caption.lastIndexOf(colors[i]);
		index.push(resIndex);
	}
	var lastIndex = Math.max.apply(Math, index);
	if (lastIndex > -1) {
		return caption.substr(lastIndex, 3);
	} else return "";
}

API.onResourceStart.connect(
	() => {
        // ReSharper disable once WrongExpressionStatement
		new ClientConsole();
	}
);

API.onServerEventTrigger.connect(
	(eventName: string, args) => {
		if (cConsole != null) {
			switch (eventName) {
			    case "console_client_server_msg_output":
                    cConsole.output(args[0], args[1], args[2]);
				    break;
			    case "console_client_function_printCmdError":
				    cConsole.printCmdError(args[0]);
				    break;
			    case "console_client_function_registerCommands":
				    cConsole.registerServerCommands(args[0]);
                    break;
                case "console_client_function_enableConsole":
                    ConsoleConfig.enabled = args[0];
                    break;
			}
		}
	}
);

API.onKeyDown.connect(
	(sender, e) => {
		if (!API.isChatOpen() && !API.isCursorShown()) {
			if (cConsole != null) {
                if (e.KeyCode === ConsoleConfig.openKey) {
                    if (ConsoleConfig.enabled) {
						cConsole.visible = !cConsole.visible;
					}
				}
				if (cConsole.visible) {
					if (e.KeyCode === Keys.PageUp) {
						cConsole.pageUp();
						return;
					}
					else if (e.KeyCode === Keys.PageDown) {
						cConsole.pageDown();
						return;
					}
					switch (e.KeyCode) {
					case Keys.Back:
						cConsole.removeCharLeft();
						break;
					case Keys.Delete:
						cConsole.removeCharRight();
						break;
					case Keys.Left:
						cConsole.moveCursorLeft();
						break;
					case Keys.Right:
						cConsole.moveCursorRight();
						break;
					case Keys.Up:
						cConsole.goCommandHistoryUp();
						break;
					case Keys.Down:
						cConsole.goCommandHistoryDown();
						break;
					case Keys.Enter:
						cConsole.executeInput();
						break;
					case Keys.Escape:
						cConsole.visible = false;
						break;
					case Keys.End:
						cConsole.setCursorToEnd();
						break;
					case Keys.Tab:
						cConsole.tabAutoComplete();
						break;
					default:
						cConsole.addInputChar(API.getCharFromKey(e.KeyValue, e.Shift, e.Control, e.Alt));
					}
				}
			}
		}
	}
);

API.onUpdate.connect(
	() => {
		if (cConsole != null) {
			cConsole.draw();
		}
	}
);
