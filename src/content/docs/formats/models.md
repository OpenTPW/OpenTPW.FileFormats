---
title: MD2 models (*.md2)
---

Theme Park World's MD2 is a model format unrelated to Quake MD2. This page describes version `0xDD`; the animation-only files use the same header and are described in [MD2 animation](../animation/). Integers and IEEE 754 floats are little-endian. Offsets below are byte offsets from the start of the file; zero denotes an absent optional block.

The layouts below follow the [OpenTPW model reader](https://github.com/hzjppkk/OpenTPW/blob/8c28e4d/source/OpenTPW.Files/Formats/Model/ModelFile.cs). The common node layout and numbering were also checked across all 2,117 version `0xDD` files with mesh tables in the Traditional Chinese data set. This is a data-set-specific check, not a claim about every release.

## Header

Source for the table: full-data model parse of the checked `0xDD` corpus, interpreted by the model reader linked above.

| Offset | Type | Meaning |
| --- | --- | --- |
| 0x00 | u32 | Magic `0x1CD15D46` |
| 0x04 | u32 | Version, `0xDD` for the layout on this page |
| 0x36 | u16 | Frame / texture-reference count |
| 0x42 | u16 | Node count, including meshes and transform-only nodes |
| 0x44 | u16 | Mesh count |
| 0x50 | u32 | Offset of the texture-reference table, 8 bytes per entry |
| 0x54 | u32 | Offset of the frame table, 16 bytes per entry |
| 0x6c | u32 | Optional heightfield offset; see [terrain](../terrain/) |
| 0x70 | u32 | Mesh table offset; zero in animation-only files |
| 0x74 | u32 | Transform-only node table offset |
| 0x98 | u32 | Animation block offset in animation files |

Other header fields are not established here. Version `0xCF`, including `wr_tunnel*.md2`, uses a different layout that has not been decoded. Version `0x18` is also an older, different layout; do not assume that the `0xDD` offsets apply. The version field and these limits are documented in the [model tests](https://github.com/hzjppkk/OpenTPW/blob/8c28e4d/source/OpenTPW.Tests/ModelTests.cs).

## Nodes and transforms

The first `mesh count` nodes are mesh records, `0xA0` bytes each. The remaining `node count - mesh count` are transform-only records, `0x58` bytes each. Both record types begin with this common prefix (source: model reader; node prefix checked over the data set above):

| Offset within record | Type | Meaning |
| --- | --- | --- |
| 0x00 | u32 | Flags; transform-only nodes have bit `0x200` in the checked data |
| 0x04 | u32 | Parent record file offset, in either node table; an unrecognized offset is treated as a root by the reader |
| 0x08 | u32 | Next sibling record offset |
| 0x0c | u32 | First child record offset |
| 0x10 | 16 × f32 | Local 4×4 matrix, row-vector convention; translation is in the last row |
| 0x50 | u32 | Node identifier in the low 16 bits |
| 0x54 | u32 | Offset of a zero-terminated node name |

A node's world transform is its local matrix multiplied by its parent's world matrix. Parents can follow children in file order. Preserve the matrix as stored: some matrices are not decomposable into a simple rotation and scale. A transform-only node has no mesh but participates in the hierarchy and can be targeted by animation.

## Mesh records and geometry

Source: full-data parse with the model reader linked above; individual unknown fields are left unidentified. The UV upload is also associated with `FUN_00580530 (US 0x580530)`.

After the common node prefix, a `0xA0`-byte mesh record contains (source: model reader):

| Offset within record | Type | Meaning |
| --- | --- | --- |
| 0x58 | u16 | Stored position count |
| 0x5a | u16 | Material count |
| 0x5c | u16 | Face count |
| 0x5e | u16 | Expanded vertex / vertex-order count |
| 0x60 | u32 | Position array offset |
| 0x64 | u32 | Normal or prelit-colour array offset; zero if absent |
| 0x68 | u32 | UV array offset |
| 0x6c | u32 | Material array offset |
| 0x70 | u32 | Face array offset |
| 0x94 | u32 | Vertex-order array offset |

Positions are stored in groups of four: four X floats, four Y floats, then four Z floats. The final group is padded to four. UVs likewise use groups of four U floats followed by four V floats, padded to four. The vertex-order array is `u16` indices into stored positions, one per expanded vertex; UVs correspond to expanded vertices. Stored V is bottom-up relative to the decoded image: a top-down sampler uses `(u, 1 - v)`. The UV orientation was checked against a model and its corresponding decoded texture; it is not a full-data check.

Each face record is 8 bytes: an unidentified `u16`, followed by three `u16` indices into the expanded vertices. At `+0x64`, the reader takes one `float3` normal per expanded vertex, or one `u32` ARGB colour per expanded vertex if the node flags contain `0x01000000`. It calculates normals when no normal array is present. Unknown fields and padding are not assigned meanings.

## Materials and texture references

Source: full-data parse with the model reader linked above.

Each material record is 16 bytes (source: model reader):

| Offset within record | Type | Meaning |
| --- | --- | --- |
| 0x00 | u32 | Offset of an entry in the texture-reference table; zero means no texture |
| 0x04 | 2 × u16 | Unidentified |
| 0x08 | u16 | First expanded vertex index, inclusive |
| 0x0a | u16 | Last expanded vertex index, inclusive |
| 0x0c | u32 | Unidentified |

The texture-reference table has an 8-byte stride; its first `u32` supplies flags. For a nonzero material reference, the corresponding frame index is `(reference - textureTableOffset) / 8`. The 16-byte frame entry contains a name offset at `+0x0c`; the reader takes 20 bytes at that offset and uses the filename without extension as the texture name. Other frame and reference fields remain unidentified. A zero material reference must not be interpreted as a texture-table entry.
