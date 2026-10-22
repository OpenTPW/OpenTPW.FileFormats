---
title: Terrain heightfield (base.md2)
---

Each level's ground is the heightfield inside `levels/<level>/terrain/base.md2` (in the level's wad).
The lobby's `Base.MD2` has one too. It is an ordinary `.md2` model with one extra block, found
through the pointer at header offset **0x6C** (a file offset).

The game loads it from `%s\Terrain\base.md2` in `0x44F710`. Addresses refer to the Traditional
Chinese `TP.exe` (built 1999-11-16). Checked on every level of that release.

## File Format

The block is 0x30 bytes:

| Offset | Size          | Description                                                     |
| ------ | ------------- | --------------------------------------------------------------- |
| 0x04   | 2 bytes       | Corner count, `(W + 1) × (D + 1)` (`0x44F970`)                  |
| 0x06   | 2 bytes       | Cell count, `W × D`                                             |
| 0x10   | 2 × 4 bytes   | Cell size along X and along Z, floats (`10` in every level)     |
| 0x18   | 2 × 4 bytes   | Width `W` and depth `D` in cells (`96 × 85` in every level)     |
| 0x20   | 2 × 4 bytes   | Lowest and highest height, floats                               |
| 0x28   | 4 bytes       | File offset of the corner heights                               |
| 0x2C   | 4 bytes       | File offset of the cell attributes                              |

Offsets 0x00 and 0x08 - 0x0F are not identified.

**Corner heights**: one float (Y) per corner, row by row along Z - `(W + 1)` corners to a row,
`(D + 1)` rows.

**Cell attributes**: 4 bytes per cell, in the same order.

| Byte | Description                                                                         |
| ---- | ----------------------------------------------------------------------------------- |
| 0    | Bit 0 - water (rivers and lakes); the river models draw these cells, and byte 2 is then 0 |
| 2    | Ground texture, as an index into the model's frame (texture) list                    |

The lobby's `Base.MD2` is 111 × 110 cells, all water, at height 0.
