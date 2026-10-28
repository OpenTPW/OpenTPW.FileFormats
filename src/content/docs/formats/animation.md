---
title: MD2 animation (*.md2)
---

An animation is a separate MD2 file whose tracks refer to nodes of a base [MD2 model](../models/). This page describes the `0xDD` layout used by Theme Park World. Integers and IEEE 754 floats are little-endian, and offsets are absolute file offsets. The structures and evaluation rules below follow [ModelAnimation.cs](https://github.com/hzjppkk/OpenTPW/blob/8c28e4d/source/OpenTPW.Files/Formats/Model/ModelAnimation.cs) and [AnimationFiles.cs](https://github.com/hzjppkk/OpenTPW/blob/8c28e4d/source/OpenTPW.Files/Formats/Model/AnimationFiles.cs); implementation-specific behavior is identified as such. A Traditional Chinese data-set check parsed 1,278 animation files, and evaluated the 1,274 for which a base model was present; this does not establish behavior for all releases or malformed inputs.

## Files and time

Sources: `FUN_00461f10 (US 0x461f10)` for file lookup, `FUN_00472c60 (US 0x472c60)` for time, and `FUN_00472f60 (US 0x472f60)` for slot selection.

The slot letters in order are `C D I L S M E U W B R O`; slot `0xC` means no animation. For model `<name>.md2` and slot `M`, the numbered clips are `<name>M1.md2`, `<name>M2.md2`, and so on. Clip indices are zero-based in memory, but filenames are one-based. The loader collects consecutive numbered files and stops at the first missing number. Only when `M1` is missing does it try the single unnumbered `<name>M.md2`; it does not use that fallback after finding numbered clips. File lookup is case-insensitive, including names inside archives.

Animation files normally have a header with the base model's counts, no mesh table (`0x70` is zero), and an animation block offset at `0x98`. Track nodes are numbered as in the base model: meshes first, then transform-only nodes. At playback speed 1, one second is 30 frames: `frame = elapsedMilliseconds * speed * 0.03`. Start and end frames are stored in the block; looping and clip selection are playback choices rather than properties of the key layouts.

## Animation block and track records

Source: full-data animation parse described above, as interpreted by the linked reader.

The block address is read from header `0x98` (zero means no block):

| Offset within block | Type | Meaning |
| --- | --- | --- |
| 0x00 | u32 | Block flags |
| 0x04 | u32 | Start frame |
| 0x08 | u32 | End frame |
| 0x12 | u16 | Track count |
| 0x1a | u16 | Segment hidden-node reference count |
| 0x2c | u32 | Offset of track table, 0x40 bytes per track |
| 0x38 | u32 | Offset of hidden-node `u16` references |

Hidden-node references are separate from visibility tracks. The reader can bind them either as node indices or as authored node IDs, according to the instance's binding choice; it can also disable segment hiding. Remaining block fields are not identified here.

| Offset within track | Type | Meaning |
| --- | --- | --- |
| 0x04 | u32 | Track flags |
| 0x08, 0x0c | u32 | First and last frame |
| 0x10, 0x12 | u16 | Rotation and scale key counts |
| 0x14 | u16 | Base model node index |
| 0x16 | u16 | Visibility entry count |
| 0x18 | u32 | Path data offset |
| 0x1c, 0x20 | u32 | Rotation and scale key offsets |
| 0x24 | u32 | Route data offset for flag `0x200`; layout not described here |
| 0x28, 0x2c | u32 | Vertex and texture-coordinate key offsets |
| 0x30, 0x34 | u32 | Visibility and rotation ease-curve offsets |

| Flag | Track data |
| --- | --- |
| `0x00001` | Path translation |
| `0x00008` | Rotation keys |
| `0x00080` | Scale keys |
| `0x00200` | Route data; not decoded by this reader |
| `0x00400` | Face along the path, with path translation |
| `0x01000` | Vertex keys |
| `0x04000` | With `0x1000`, per-frame float vertices instead of packed keys |
| `0x10000` | Texture-coordinate keys |
| `0x20000` | Visibility entries |

## Transforms and visibility

Source: `FUN_00471860 (US 0x471860)` and the linked evaluator.

The reader applies visibility, vertices, rotation, scale, and translation in that order; it then evaluates UVs and resolves world transforms. Rotation, scale and path key searches choose the last key at or before the current frame and the following key. Before the first key they leave that component unchanged; after the last they hold it. The interpolation fraction is clamped to `[0, 1]` and is zero if the two frame numbers are equal.

A rotation key is 20 bytes: `u16 frame`, `u16 ease index`, and four floats `(x, y, z, w)`. `0xffff` selects linear time; otherwise the index selects an eight-byte ease curve. The bytes give samples at ninths, scaled by 1/255, with implicit endpoints 0 and 1; the reader interpolates between samples. Rotations use quaternion slerp without flipping the second quaternion to force the shortest arc. A scale key is 16 bytes: `u16 frame`, an unidentified `u16`, and three floats. Scale interpolates linearly and sets the lengths of the matrix's first three rows.

The path header is `u32 flags`, `u16 point count`, `u16 key count`, `u32 point array offset`, `u32 key array offset`. Points are float3; each key has a `u16` frame in a 4-byte record, whose remaining two bytes are not interpreted. Flag `0x08` selects linear segments; otherwise `0x02` selects cubic Bézier with three points per key, and the reader uses Catmull–Rom when neither flag is set. If both are set, the point evaluator takes the linear branch. Linear paths clamp at the final point; the curved paths wrap their point indices. With `0x400`, the track faces the path direction. The implementation approximates the direction with a small step; do not treat that approximation as a binary-format field.

Visibility entries are signed 16-bit values. Their absolute value is a frame; positive means show, zero or negative means hide. The last entry in the list whose frame has been reached wins; before any entry is reached, the existing visibility is retained.

## Packed vertex keys

Source: `FUN_004714a0 (US 0x4714a0)` and the full-data animation parse described above.

With `0x1000` and without `0x4000`, the vertex block is:

| Offset within block | Type | Meaning |
| --- | --- | --- |
| 0x00 | u8 | Flags; bit `0x02` makes group 1 a static pose |
| 0x02 | u16 | Group count |
| 0x0c | u32 | Group table offset, 20-byte records |
| 0x14 | 3 × f32 | Base position |
| 0x20 | 3 × f32 | Per-axis scale |

Each group starts with `u16 key count`, `u16 vertex count`, and three `u32` offsets to vertex indices, frames and packed values; the final four bytes of its 20-byte record are unidentified. Vertex indices and frames are `u16`; indices refer to stored positions before vertex-order expansion. Values are key-major: one `u32` per vertex per key. Three signed 10-bit components occupy bits 0–9, 10–19 and 20–29; sign-extend each and compute `position = component * scale + base` per axis. Group 0 describes the bounding box. When bit `0x02` is set, group 1 is applied as a static pose before animated groups. The reader linearly blends neighboring keys, clamps the fraction, and holds the endpoints.

## Per-frame vertices

Source: the full-data animation parse and linked evaluator.

With both `0x1000` and `0x4000`, the vertex block has `u32 source-index table offset`, `u32 positions per frame`, and `u32 position array offset`. A zero source offset means one-to-one indexing; otherwise the reader uses a `u32` mapping. The positions are float3 values grouped by frame, and the reader requests `last track frame + 1` frames, bounded by file length. It selects the current whole-frame entry, clamped to available frames, with no interpolation. Animated stored positions are expanded through the base mesh's vertex-order table afterward.

## Texture-coordinate keys

Source: `FUN_004745c0 (US 0x4745c0)` and the full-data animation parse described above.

The UV block contains five `u32` values: coordinate count, offset of per-coordinate ranges, total key count, offset of `u16` frames, and offset of float2 values. Each range is `u16 start index, u16 count`; the range selects entries in both key arrays. Coordinates are in expanded-vertex order. For each coordinate the reader searches for the first key after the current whole frame, interpolates from the previous key using the fractional frame, holds the first before its frame, and holds the last after it. A zero-length or invalid range is not evaluated by the reader.
