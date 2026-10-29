---
title: Bitmap fonts (*.bf4)
---

The game's interface text is drawn with bitmap fonts, `Language/<language>/*.bf4`. Each language has
its own set, numbered in the folder's [resource index](/formats/resources/).

Checked on every font of the English (European release, built 1999-10-25), Traditional Chinese
(built 1999-11-16) and Simplified Chinese releases. Addresses refer to the Traditional Chinese
`TP.exe`.

## File Format

**Header**

| Size            | Description                                   |
| --------------- | --------------------------------------------- |
| 4 bytes         | Magic number - `F4FB`                         |
| 1 byte          | Version - `1` or `2`                          |
| 1 byte          | Size hint                                     |
| 2 bytes         | Glyph count                                   |
| 4 bytes × count | Offset of each glyph                          |

There is one glyph per character of the language's [code page](/formats/strings/#encoding), in the
same order - `TITLEMED.bf4` in the Traditional Chinese release has 13,740 glyphs, as many as its
`MBToUni.dat` has characters.

**Glyph (at offset)**

| Offset | Size    | Description                                                                 |
| ------ | ------- | --------------------------------------------------------------------------- |
| 0x00   | 4 bytes | Character, UTF-16                                                           |
| 0x04   | 4 bytes | Bitmap size in bytes (a multiple of 8)                                      |
| 0x08   | 4 bytes | Size the bitmap would have at 4 bits per pixel                              |
| 0x0C   | 4 bytes | Encoding - see below (`0` for empty glyphs)                                 |
| 0x10   | 2 bytes | Width                                                                       |
| 0x12   | 2 bytes | Height                                                                      |
| 0x14   | 1 byte  | X offset, signed                                                            |
| 0x15   | 1 byte  | Y offset from the top of the line, signed (negative for e.g. `$`)           |
| 0x16   | 2 bytes | Advance                                                                     |
| 0x18   | *n* bytes | Bitmap, rows not padded                                                   |

Unused slots repeat a placeholder character; a reader keeping one glyph per character should keep
the first.

### Encodings

| Value | Bitmap                                                            |
| ----- | ----------------------------------------------------------------- |
| 0     | 4 bits per pixel, high nibble first                               |
| 1     | Run-length coded 4 bits per pixel (below)                         |
| 2     | 1 bit per pixel, most significant bit first                       |

Values are coverage, so a 4-bit value of 15 is solid and 0 is transparent; encoding 2 is either on
or off.

The same font can be stored differently per release. In English the `TITLE*` fonts mix encodings
0 and 1 (anti-aliased), while in Traditional Chinese 13,695 of `TITLEMED.bf4`'s 13,740 glyphs are
encoding 2 and the rest are empty - which is why the Chinese interface text has hard edges. Over all
fonts, English has 4,373 / 2,326 / 1,518 glyphs of encodings 0 / 1 / 2, Traditional Chinese 164,117 /
1,049 / 274,514 (empty glyphs count as encoding 0).

Encoding 1 is read as 4-bit units, high nibble first. A non-zero unit is one pixel of that value. A
zero is followed by a count unit and a value unit, for that many pixels of that value. The last run
may go one pixel past the glyph (clip it), and pixels after the data ends are transparent. With these rules all 4,495 encoding 1
glyphs in the three releases decode without running more than one pixel past the glyph.

### Laying out a line

The line's height runs from the highest glyph top (the most negative Y offset) to the lowest glyph
bottom (Y offset + height). Each glyph is drawn at the pen position plus its X offset, and the pen
then moves by the advance.

## How the game picks a font

Code does not name a font file. It asks for one of 13 **font slots** (`0x483D20`, slot 0 to 12), and
the slot is looked up in one of four **sets**. The table is filled at startup from the resource
index by `0x419390`, and the set in use is stored at `0x786DEC`. It starts as 1 (`0x4191F0`) and is
still 1 in the running game at 640x480; what would change it has not been found.

| Slot | Set 0             | Set 1             | Set 2            | Set 3            |
| ---- | ----------------- | ----------------- | ---------------- | ---------------- |
| 0    | `MENUSMALL`       | `MENUMED`         | `MENUBIG`        | `MENUBIG`        |
| 1    | `CASHSMALL`       | `CASHMED`         | `CASHBIG`        | `CASHBIG`        |
| 2    | `SESHSMALL`       | `SESHMED`         | `SESHBIG`        | `SESHBIG`        |
| 3    | `DATETINY`        | `DATESMALL`       | `DATEBIG`        | `DATEBIG`        |
| 4    | `GAME6AA`         | `GAME10AA`        | `GAME8AA`        | `GAME12AA`       |
| 5    | `TITLESMALL`      | `TITLEMED`        | `TITLEBIG`       | `TITLEBIG`       |
| 6    | `GAME5AA`         | `GAME7`           | `GAME8`          | `GAME9`          |
| 7    | `GAME6AA`         | `GAME8`           | `GAME9`          | `GAME10`         |
| 8    | `GAME5AA`         | `GAME8AA`         | `GAME8AA`        | `GAME12`         |
| 9    | `GAME5AA`         | `GAME7`           | `GAME8`          | `GAME9`          |
| 10   | `CONSOLE6`        | `CONSOLE6`        | `CONSOLE6`       | `CONSOLE6`       |
| 11   | `GAME6AA`         | `GAME7`           | `GAME8`          | `GAME9`          |
| 12   | `POSTCARD`        | `POSTCARD`        | `POSTCARD`       | `POSTCARD`       |

The table is filled by resource ID, and the IDs are those of the Chinese releases (the English
release numbers its fonts differently - see the [resource index](/formats/resources/)). `GAME6`,
`GAME7AA`, `GAME9AA`, `COURIER8` and `DATEMED` are in the data but not in this table.

For example, the lobby's button labels are slot 5 (set up in `0x4A4010`), so at 640x480 they are
drawn in `TITLEMED.bf4`.
