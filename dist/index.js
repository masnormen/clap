class Command {
    constructor(name) {
        this.aliases = [];
        this.short_flag_aliases = [];
        this.long_flag_aliases = [];
        this._args = {};
        this.subcommands = [];
        this.name = name;
    }
    static new(name) {
        return new Command(name);
    }
    arg(arg) {
        this._args[arg.id] = arg;
        return this;
    }
    args(args) {
        for (const arg of args) {
            this._args[arg.id] = arg;
        }
        return this;
    }
}
class Arg {
    constructor(id) {
        this.conflicts_with = [];
        this.groups = [];
        this.requires = [];
        this.r_ifs = [];
        this.aliases = [];
        this.short_aliases = [];
        this.val_names = [];
        this.val_delim = ",";
        this.default_vals = [];
        this.id = id;
    }
    static new(id) {
        return new Arg(id);
    }
    short(short) {
        this.short_val = short;
        return this;
    }
    help(help) {
        this.help_val = help;
        return this;
    }
}
const x = Command.new("My Program").args([
    Arg.new("help").short("d").help("turns on debugging mode"),
    Arg.new("build"),
]);
console.log(x);
export {};
