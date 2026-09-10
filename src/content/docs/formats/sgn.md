---
title: Park signs (*.sgn)
---

A `.sgn` holds everything a park's name board needs: the artwork painted on the board, and the
fonts its name is lettered in. The name itself is not in here — it comes from the park's script
(see [Where the name comes from](#where-the-name-comes-from)).

Five ship with the game:

| File | Park |
| --- | --- |
| `lobby.wad` → `terrain\Jun_isle.sgn` | Jungle ("Lost Kingdom") |
| `lobby.wad` → `terrain\Hal_isle.sgn` | Hallow ("Halloween") |
| `lobby.wad` → `terrain\Fan_gate.sgn` | Fantasy |
| `lobby.wad` → `terrain\Spa_gate.sgn` | Space |
| `levels\<park>\features\sign1.wad` → `sign1.sgn` | the placeable in-park sign |

Note the inconsistent naming. A `.sgn` is named after **the model that carries the `sign1` and
`sign2` materials**, which is the island model for jungle and hallow but the gate model for
fantasy and space — so a lookup has to try both rather than assume either.

## File format

The header is a fixed size: the image body starts at `0x43DD` in all five files.

> Rows marked **(engine-confirmed)** were checked against the original game's own reader and
> sign compositor rather than inferred from the shipped files alone — the reader loads the header
> field by field in file order, which is what fixes the sizes and the boundaries below.

| Offset | Size | Description |
| --- | --- | --- |
| `0x0000` | 4 bytes | Version — the engine requires `> 99`; all five files are `101` (engine-confirmed) |
| `0x0004` | 4 bytes | Unknown — `0` in all five |
| `0x0008` | 1 byte | Unknown — `1` in all five |
| `0x0009` | 4 bytes | **Line 0 mode** — see **Line modes** below (engine-confirmed) |
| `0x000D` | 4 bytes | **Line 1 mode** (engine-confirmed) |
| `0x0011` | 436 bytes | Font record 0 |
| `0x01C5` | 436 bytes | Font record 1 |
| `0x0379` | 20 bytes | **Line 0 ink** — see **Line ink** below (engine-confirmed) |
| `0x038D` | 20 bytes | **Line 1 ink** (engine-confirmed) |
| `0x03A1` | 36 bytes | Unknown — three ints (`16`, `128`, `4`) then six 4-byte entries |
| `0x03C5` | 16384 bytes | 32-bit pixel data — see below |
| `0x43C5` | 4 x float | Y, Cb, Cr and A quantisation scales (`6, 10, 2, 6` in all five files) |
| `0x43D5` | 4 bytes | Colour chunk size |
| `0x43D9` | 4 bytes | Alpha chunk size |
| `0x43DD` | | Colour chunk, then alpha chunk |

### Font record

| Offset | Size | Description |
| --- | --- | --- |
| `+0x000` | 64 bytes | Display name, NUL-padded ASCII (e.g. `Young Itch AOE`) |
| `+0x040` | 260 bytes | TrueType file name (e.g. `YOUNIA__.TTF`) — the file itself is in `fonts.wad` |
| `+0x144` | 4 bytes | Unknown |
| `+0x148` | 4 bytes | Unknown |
| `+0x14C` | 60 bytes | A Windows **`LOGFONTA`** (engine-confirmed) |
| `+0x188` | 44 bytes | Read by a separate helper; contents not established |

There is one record per line of the sign. Jungle letters its two lines in different fonts
(`Young Itch AOE` then `Clunker AOE`); Space names the same font twice.

The original letters its signs with GDI, so it stores a `LOGFONT` rather than a size and weight of
its own. That structure is why the display name appears to occur a second time part-way through
the record: `LOGFONTA.lfFaceName` sits at `+28` within it, which is `+0x168` from the record
start. Its `lfHeight` is the usual negative character height (`-144` for jungle's first line).

> **The floats in the tail are not a colour.** Reading the record as two 64-byte name fields
> instead gives eight tidy floats at `+0x18C`, three of which always land in `0..1` and look
> convincingly like a text colour — jungle's are `0.40, 0.87, 0.31`, a green. They are not. That
> offset falls past the end of the `LOGFONT`, inside the 44-byte tail above, and the values belong
> to whatever the helper reads there.
>
> The trap is worth spelling out because the wrong reading survives a casual check: three of the
> four parks have dark boards, so lettering them in some wrong colour still shows up. Only Fantasy
> gives it away — its board is painted pale mint and those floats are very nearly the same mint,
> so its name comes out invisible. The real ink is below.

### Line ink

Each line's colour is a four-byte block sitting after both font records, followed by four more
4-byte fields that are not yet identified — 20 bytes per line. A line whose mode is `0` is absent
and contributes no block at all, though no shipped sign does that.

| Offset | Size | Description |
| --- | --- | --- |
| `+0x00` | 1 byte | Red |
| `+0x01` | 1 byte | Green |
| `+0x02` | 1 byte | Blue |
| `+0x03` | 1 byte | Opacity |
| `+0x04` | 4 x 4 bytes | Unknown — an int, a float, then two more ints |

Three steps in the engine fix that ordering, and none of it has to be guessed. The loader reads
the four bytes **singly** into consecutive bytes of its sign object. The renderer hands them to
the compositor with the fourth byte first and the other three after it. The compositor walks the
glyph's coverage mask and moves each board pixel that fraction of the way toward the three
channels, writing them into bytes 1, 2 and 3 of a pixel whose byte 0 is the coverage — and that
same function later packs the buffer as **ARGB4444**, which is what makes byte 1 red rather than
blue.

The opacity is a genuine blend and not a threshold, so a line set below full strength tints the
board and lets the artwork show through the lettering.

What the four lobby signs ask for:

| File | Mode | Line 0 | Line 1 |
| --- | --- | --- | --- |
| `Fan_gate.sgn` (Fantasy) | 1 | `#808000` olive, 67% | `#808000` olive, 66% |
| `Hal_isle.sgn` (Hallow) | 1 | `#00FF00` green, 79% | `#00FF00` green, 84% |
| `Jun_isle.sgn` (Jungle) | 2 | `#000000` black, 60% | *(never read)* |
| `Spa_gate.sgn` (Space) | 2 | `#FF80FF` pink, 100% | *(never read)* |

### Line modes

The two 4-byte fields at `0x0009` and `0x000D` say how each line is laid down. `1` inks the line
on its own; `2` means the two lines are drawn as one.

That distinction matters for colour. At mode `2` the engine maxes both glyph masks into a single
surface and then runs **one** colour over the result, so the second line's own four bytes are
never reached and both words come out in the first line's ink. `Jun_isle.sgn` and `Spa_gate.sgn`
are both mode `2`; `Fan_gate.sgn` and `Hal_isle.sgn` are mode `1` and ink each line separately. A
file whose two modes disagree takes a third path that nothing in the shipped data exercises.

Mode `2` is also the likelier home of the six 4-byte entries at `0x03A1`. They are a constant
`FF DB FF 30` repeated in three of the four signs, but in `Jun_isle.sgn` they are six distinct
values that climb steadily (`00 2F 5C 80`, `00 31 58 78`, … `00 3F 58 75`) — which reads like a
small gradient or palette, and would explain why Lost Kingdom's flat black is not the whole story
of how its board looks. This is **not** established.

### The pixel data at `0x03C5`

16384 bytes, which is 64x64 at 32 bits per pixel. It decodes to a small tiling pattern rather
than to anything resembling the sign, so while it is clearly image data, its dimensions and
purpose are not established. It is **not** the sign artwork — that is the image body below.

## The image body

Everything from `0x43C5` is a [`.wct`](/formats/texture/) version 4 image with its header fields
rearranged: four quantisation scales, two chunk sizes, then the colour and alpha chunks, each
wrapped in the same `BILZ` zlib container a `.wct` uses. A decoder can be handed these directly.

The image is **256x128**, decoded at an aligned size of 256 and with the half-scale path (the
`FullScale` flag clear). That gives the expected chunk sizes:

- colour inflates to 98304 = `256*256` (Y) + `128*128` (Cb) + `128*128` (Cr)
- alpha inflates to 65536 = `256*256`

The alpha channel is uniform and opaque in all four lobby signs — it compresses to 190 bytes in
every one — so the board is a solid picture, not a cut-out.

**The artwork is a blank board.** Jungle's is cracked bark, fantasy's a mint wall, hallow's a
framed maroon panel, space's a starfield. No lettering is baked in; the park name is composited
on top at runtime using the fonts named above. The clearest evidence is that the colour chunk's
*compressed* size tracks the length of the park name — 5,607 bytes for "Space" (5 characters),
7,126 for "Halloween" (9), 11,760 for "Lost Kingdom" (12) and 14,606 for "Fantasy Island" (14) —
even though every file inflates to the same 98304 bytes.

## How the board maps onto the model

The model draws the board as **two 128x128 panels side by side**, using materials `sign1` and
`sign2`, each taking a full 0..1 UV range. `sign1` is the left half of the sheet and `sign2` the
right. Each material appears twice, once per face, mirrored, so the sign reads correctly from
either side.

Laying a two-line name out across the whole 256x128 sheet and then cutting it down the middle is
what puts "Lost" above "Kingdom" on the assembled board.

## Where the name comes from

Each park has a script at the root of `lobby.wad`, named after the park, holding a single
`ISLAND()` line whose fourth quoted field is the sign text:

```
ISLAND(0,"data\lobby\terrain","jun_isle","jun_gate","Lost Kingdom",90.0,12.5)
```

The others read `"Fantasy"`, `"Halloween"` and `"Space"`. The same line also names the terrain
directory and the two models, and ends with two numbers that look like a heading and a size.
