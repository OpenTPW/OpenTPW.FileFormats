---
title: Strings (*.dat, *.str)
---

Each language has its own folder, `Language/<language>/`, holding the code page, the string tables
and the [fonts](/formats/fonts/). The game finds them by number through the folder's
[resource index](/formats/resources/).

The details below were checked on every file of the English (European release, built 1999-10-25),
Traditional Chinese (built 1999-11-16) and Simplified Chinese releases. Addresses refer to the
Traditional Chinese `TP.exe`.

## Encoding

Strings are stored in a "Bullfrog multibyte" encoding and converted to Unicode with two files:
`MBToUni.dat` (multibyte to Unicode) and `UniToMB.dat` (Unicode to multibyte). The contents differ
per language: English needs a single byte per character, the Chinese releases add two-byte codes.

### File Format (`MBToUni.dat`)

**Header**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 4 bytes            | Magic number - `BFMU`                                                          |
| 2 bytes            | Lead byte count *L* - `0` English, `54` Traditional Chinese, `86` Simplified Chinese |
| 2 bytes            | Character count in English (`249`); not a count in the Chinese files           |

**For each character, to the end of the file**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 2 bytes            | The character, UTF-16                                                          |

The files hold 249, 13,740 and 22,026 characters respectively.

### Decoding

Codes start at 1. Byte values from `256 - L` upwards start a two-byte code; everything below is a
single-byte code:

- single byte `c` - character `c - 1`
- lead byte `l`, trail byte `t` - character `(255 - L) + (l - (256 - L)) * 255 + (t - 1)`

With `L = 0` (English) every code is a single byte and the formula reduces to `c - 1`. The game
computes the same thing in `0x6AB2B0`. Every string of all three releases decodes with no code out
of range, and the text reads correctly - `UITEXT.str` string 7 is "Resume Game", "繼續遊戲" and
"继续游戏".

## Storage

The Bullfrog String file format (*.str) is used in order to store localized strings for in-game text.
These don't have any specific character encoding - they use the two aforementioned file formats to convert to and from 'Bullfrog Multi-byte' characters.

### File Format

**Header**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 4 bytes            | Magic number - `BFST`                                                          |
| 4 bytes            | Table ID - the table's number in the [resource index](/formats/resources/) (`0x3EE` for `UITEXT.str`) |
| 4 bytes            | String count                                                                   |

**String Directory**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 4 bytes            | String offset (from the end of the string count)                               |

**For each string (at offset)**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 1 byte             | Unknown - always `01`                                                          |
| 3 bytes            | String length, in bytes (not characters)                                       |
| *n* bytes          | Characters in BFMU format                                                      |

The length counts bytes, so a two-byte code counts twice: "Resume Game" is 11 bytes, "繼續遊戲" 8.
Strings can be long - `UITEXT.str` string 416 is 1121 bytes. An empty string has length 0; one
empty entry in the Traditional Chinese `TAG_SYSTEM.str` (string 140) is four zero bytes, without the
`01`.

Each string is followed by at least four bytes before the next one starts, and often more, so read
strings through the directory rather than one after another.

### `UITEXT.str`

The interface strings. All three releases have 473 strings in the same order, so an index means the
same thing in every language - for example 37 "Scrap value", 68 "Energy", 207 "Send Postcard", 420
"Create New Player" and 472 the unsent postcards warning.
