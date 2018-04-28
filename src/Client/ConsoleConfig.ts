/// <reference path="Console.d.ts"/>

class ConsoleConfig {
    private static _helpCommand: string = "-help";
    private static _clearCommand: string = "-clear";
    private static _exitCommand: string = "-exit";
    private static _enabled: boolean = false;
    private static _key = Keys.F6;

    private static _commandError: string = "~r~ERROR:~w~ Command not found.";

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

    public static get commandError(): string { return this._commandError; }
    public static set commandError(value: string) { this._commandError = value; }
}
