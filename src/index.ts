import myzod, { Infer } from "myzod";

//prettier-ignore
type Char = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'

class Command {
  name: string;
  long_flag?: string;
  short_flag?: Char;
  display_name?: string;
  bin_name?: string;
  author?: string;
  version?: string;
  long_version?: string;
  about?: string;
  long_about?: string;
  before_help?: string;
  before_long_help?: string;
  after_help?: string;
  after_long_help?: string;
  aliases: Record<string, boolean>[] = [];
  short_flag_aliases: Record<Char, boolean>[] = [];
  long_flag_aliases: Record<string, boolean>[] = [];
  usage_str?: string;
  usage_name?: string;
  help_str?: string;
  disp_ord?: number;
  term_w?: number;
  max_w?: number;
  template?: string;
  _args: Record<string | Char, Arg> = {};
  subcommands: Command[] = [];

  current_display_order?: number;

  constructor(name: string) {
    this.name = name;
  }

  static new(name: string) {
    return new Command(name);
  }

  public arg(arg: Arg) {
    this._args[arg.id] = arg;
    return this;
  }

  public args(args: Arg[]) {
    for (const arg of args) {
      this._args[arg.id] = arg;
    }
    return this;
  }
}

type ArgFlags =
  | "Required"
  | "Global"
  | "Hidden"
  | "NextLineHelp"
  | "HidePossibleValues"
  | "AllowHyphenValues"
  | "AllowNegativeNumbers"
  | "RequireEquals"
  | "Last"
  | "TrailingVarArg"
  | "HideDefaultValue"
  | "IgnoreCase"
  | "Exclusive";

class Arg {
  id: string;
  help_val?: string;
  long_help?: string;
  action?: string; //count, set, etc
  conflicts_with: string[] = [];
  settings?: ArgFlags;
  overrides?: string;
  groups: string[] = [];
  requires: string[] = [];
  r_ifs: ((...args: any[]) => any)[] = [];
  short_val?: Char;
  long_val?: string;
  aliases: Record<string, boolean>[] = []; // (name, visible)
  short_aliases: Record<Char, boolean>[] = []; // (name, visible)
  display_order?: number;
  val_names: string[] = [];
  num_vals?: number | [number, number]; //range
  val_delim?: string = ",";
  default_vals: string[] = [];
  index?: number;

  constructor(id: string) {
    this.id = id;
  }

  public static new(id: string) {
    return new Arg(id);
  }

  public short(short: Char) {
    this.short_val = short;
    return this;
  }

  public help(help: string) {
    this.help_val = help;
    return this;
  }
}

const x = Command.new("My Program").args([
  Arg.new("help").short("d").help("turns on debugging mode"),
  Arg.new("build"),
]);

console.log(x);
