---
title: Compiled Ride Script (*.rse)
---

RSE is a file that encompasses compiled bytecode, the contents of which are decided by the appropriate RSS file. These files follow a simple layout:

### File Format

**Header**

| Size     | Description                                                                 |
| -------- | --------------------------------------------------------------------------- |
| 4 bytes  | Magic number - `RSSE` (`52 53 53 45`)                                       |
| 4 bytes  | Opcode table checksum - `0x10F51` (`51 0F 01 00`) in every file; the game only warns when it differs |
| 4 bytes  | variable count (see **String / variable table** below)                      |
| 4 bytes  | stack size (defined by `#setstack`)                                         |
| 4 bytes  | time slice - almost always `50` (`0x32`), preprocessor directive is unknown |
| 4 bytes  | limbo size (defined by `#setlimbo`) - 8 bytes per entry                     |
| 4 bytes  | bounce size (defined by `#setbounce`) - 16 bytes per entry                  |
| 4 bytes  | walk size (defined by `#setwalk`) - 32 bytes per entry                      |
| 16 bytes | Padding - `Pad Pad Pad Pad` (includes a trailing space)                     |

**Body**

| Size    | Description                   |
| ------- | ----------------------------- |
| 4 bytes | Instruction count             |
| n bytes | Instructions                  |

**Instructions**

Instructions are written in little endian, and take the following form:

| Size    | Description |
| ------- | ----------- |
| 4 bytes | Operand     |
| n bytes | Opcodes     |

Instructions can have as many opcodes as necessary (and can also have none at all), however most instructions only require 1 to 3 opcodes.

Opcodes and operands follow a specific format:

| Size    | Description |
| ------- | ----------- |
| 2 bytes | Value       |
| 2 bytes | Flags       |

Flags are currently as follows:

- `00 00` - Literal value (the 2-byte value is signed)
- `00 10` - String (see **String / variable table** below) - the value is an offset into the string block
- `00 20` - Branch / subroutine - the value is the index of the target word in the code, not a byte offset
- `00 40` - Variable name (see **String / variable table** below)
- `00 80` - Opcode - numbered as in the game's opcode table (106 opcodes)

**String / variable table**

At the end of the file, a list of strings and variables used within instructions is inserted. Strings are added in order for string literals to be usable within a ride sequence; variables were likely included for debugging purposes, however they have little to no use while in-game.

The format of the string table is as follows:


| Size    | Description                          |
| ------- | ------------------------------------ |
| 4 bytes | String length                        |
| n bytes | Null-terminated string of characters |

The first entry within this table will typically contain a list of null-terminated strings, one after another, that are used within the file (if any).  The remaining entries will simply be variable names.

The game's loader (`0x554E40` in the Traditional Chinese `TP.exe`, built 1999-11-16) reads the
header, the code and the string block, and does not read the variable names. A running script is a
`0xF4`-byte instance; saves store these instances in their RSSE module (see [saves](/formats/saves/)).
All 308 scripts in the game load with this layout.
