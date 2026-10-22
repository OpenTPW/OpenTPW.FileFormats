---
title: Resource index (residx.dat)
---

Each language folder, `Language/<language>/`, has a `residx.dat` that gives every
[code page, string table](/formats/strings/) and [font](/formats/fonts/) in it a number. The game asks
for resources by these numbers, not by file name.

Checked on the English (European release, built 1999-10-25), Traditional Chinese (built 1999-11-16)
and Simplified Chinese releases. Addresses refer to the Traditional Chinese `TP.exe`.

## File Format

**Header**

| Size    | Description              |
| ------- | ------------------------ |
| 4 bytes | Magic number - `BFRI`    |
| 4 bytes | Entry count (56 in the Chinese releases, 52 in English) |

**For each entry**

| Size    | Description                                                         |
| ------- | ------------------------------------------------------------------- |
| 4 bytes | Resource ID                                                         |
| 2 bytes | Kind - see below                                                    |
| 2 bytes | Offset of the file name, from the end of the header                 |
| 4 bytes | Unknown - `0` in every entry                                        |

The file names follow the entries, null-terminated.

| Kind | Files                                     | IDs               |
| ---- | ----------------------------------------- | ----------------- |
| 0    | `MBToUni.dat`                             | 1                 |
| 1, 2 | `UniToMB.dat` (listed twice)              | 2, 3              |
| 3    | String tables (`*.str`)                   | `0x3E8` - `0x3FC` |
| 4    | Fonts (`*.bf4`)                           | `0x3FD` - `0x41C` (`0x418` in English) |

A string table's own header repeats its ID: `UITEXT.str` is `0x3EE` in both places.

## IDs the game uses

The string table IDs are the same in all three releases. The font IDs are not: the English release
has no `DATE*` fonts, so its `POSTCARD.bf4` is `0x418` rather than `0x41C`. Look fonts up by name,
or by the IDs of the release at hand.

String tables, loaded at startup by `0x419390`:

| ID      | File                  | ID      | File                   |
| ------- | --------------------- | ------- | ---------------------- |
| `0x3E8` | `ERRORMSG.str`        | `0x3F3` | `HANDYMAN_NAMES.str`   |
| `0x3E9` | `INGREDIENT.str`      | `0x3F4` | `MECHANIC_NAMES.str`   |
| `0x3EA` | `TAG_SYSTEM.str`      | `0x3F5` | `ENTERTAINER_NAMES.str`|
| `0x3EB` | `THOUGHTS.str`        | `0x3F6` | `GUARD_NAMES.str`      |
| `0x3EC` | `KIDSTATES.str`       | `0x3F7` | `RESEARCHER_NAMES.str` |
| `0x3ED` | `STAFFSTATES.str`     | `0x3F8` | `FEMALE_NAMES.str`     |
| `0x3EE` | `UITEXT.str`          | `0x3F9` | `ITEMTYPES.str`        |
| `0x3EF` | `UIHELPTEXT.str`      | `0x3FA` | `LOANNAMES.str`        |
| `0x3F0` | `CHAT_COMMANDS.str`   | `0x3FB` | `STAFF_TYPES.str`      |
| `0x3F1` | `THEMENAMES.str`      | `0x3FC` | `KEYBOARD.str`         |
| `0x3F2` | `OBJECT_NAMES.str`    |         |                        |

Fonts in the Chinese releases, in ID order:

| ID      | File            | ID      | File             | ID      | File            |
| ------- | --------------- | ------- | ---------------- | ------- | --------------- |
| `0x3FD` | `GAME5AA.bf4`   | `0x408` | `GAME12.bf4`     | `0x413` | `CASHBIG.bf4`   |
| `0x3FE` | `GAME6.bf4`     | `0x409` | `GAME12AA.bf4`   | `0x414` | `SESHBIG.bf4`   |
| `0x3FF` | `GAME6AA.bf4`   | `0x40A` | `CONSOLE6.bf4`   | `0x415` | `MENUSMALL.bf4` |
| `0x400` | `GAME7.bf4`     | `0x40B` | `COURIER8.bf4`   | `0x416` | `MENUMED.bf4`   |
| `0x401` | `GAME7AA.bf4`   | `0x40C` | `TITLESMALL.bf4` | `0x417` | `MENUBIG.bf4`   |
| `0x402` | `GAME8.bf4`     | `0x40D` | `TITLEMED.bf4`   | `0x418` | `DATETINY.bf4`  |
| `0x403` | `GAME8AA.bf4`   | `0x40E` | `TITLEBIG.bf4`   | `0x419` | `DATESMALL.bf4` |
| `0x404` | `GAME9.bf4`     | `0x40F` | `CASHSMALL.bf4`  | `0x41A` | `DATEMED.bf4`   |
| `0x405` | `GAME9AA.bf4`   | `0x410` | `SESHSMALL.bf4`  | `0x41B` | `DATEBIG.bf4`   |
| `0x406` | `GAME10.bf4`    | `0x411` | `CASHMED.bf4`    | `0x41C` | `POSTCARD.bf4`  |
| `0x407` | `GAME10AA.bf4`  | `0x412` | `SESHMED.bf4`    |         |                 |

How the game chooses among the fonts is described on the [fonts](/formats/fonts/#how-the-game-picks-a-font)
page.
