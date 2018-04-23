/// <reference path="Console.d.ts"/>

class ConsoleConfig {
    private static _helpCommand: string = "-help";
    private static _clearCommand: string = "-clear";
    private static _exitCommand: string = "-exit";
    private static _enabled: boolean = false;
    private static _key = Keys.F6;

    public static get helpCommand(): string { return this._helpCommand; }
    public static set helpCommand(value: string) { this._helpCommand = value; cConsole.consoleCommandChanged(); }

    public static get clearCommand(): string { return this._clearCommand; }
    public static set clearCommand(value: string) { this._clearCommand = value; cConsole.consoleCommandChanged(); }

    public static get exitCommand(): string { return this._exitCommand; }
    public static set exitCommand(value: string) { this._exitCommand = value; cConsole.consoleCommandChanged(); }

    public static get enabled(): boolean { return this._enabled; }
    public static set enabled(value: boolean) {
        this._enabled = value;
        if (!value) cConsole.visible = false;
        API.triggerServerEvent("console_client_function_enabledConsole", this._enabled);
    }

    public static get openKey(): System.Windows.Forms.Keys { return this._key; }
    public static set openKey(value: System.Windows.Forms.Keys) { this._key = value; }
}

function getHelpCommand(): string {
    return ConsoleConfig.helpCommand;
}

function setHelpCommand(command: string): void {
    ConsoleConfig.helpCommand = command;
}

function getClearCommand(): string {
    return ConsoleConfig.clearCommand;
}

function setClearCommand(command: string): void {
    ConsoleConfig.clearCommand = command;
}

function getExitCommand(): string {
    return ConsoleConfig.exitCommand;
}

function setExitCommand(command: string): void {
    ConsoleConfig.exitCommand = command;
}

function isConsoleEnabled(): boolean {
    return ConsoleConfig.enabled;
}

function setConsoleEnabled(enabled: boolean): void {
    ConsoleConfig.enabled = enabled;
}

function getOpenKey(): System.Windows.Forms.Keys {
    return ConsoleConfig.openKey;
}

function setOpenKey(key: System.Windows.Forms.Keys): void {
    ConsoleConfig.openKey = key;
}

function consoleOutput(text: string, category: number = 0): void {
    switch (category) {
        case 0:
            cConsole.info(text);
            break;
        case 1:
            cConsole.error(text);
            break;
        case 2:
            cConsole.warn(text);
            break;
        case 3:
            cConsole.debug(text);
            break;
        case 4:
            cConsole.fatal(text);
            break;

        default:
            cConsole.info(text);
    }
}
