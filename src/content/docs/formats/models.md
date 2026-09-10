---
title: Models (*.md2)
---

MD2 files store 3D models: static mesh geometry (rides, terrain, props), and separately, the
keyframe animations that pose a model's meshes over time (a gate's doors swinging, a dinosaur's
head turning). Both kinds share one file format and the same `.md2` extension - which kind a
given file is has to be determined from its contents, not its name.

An animation file sits beside the mesh it animates, with an `M1`, `M2`, ... suffix on the base
model's filename - `droid.MD2` is a mesh, `droidM1.MD2`/`droidM2.MD2` are animations of it. This
holds for 1274 of the 1279 animation files in the game; the five exceptions are `SCALE.MD2`,
`ROTATE.MD2`, `FLY.MD2`, `anim.MD2` and `scatM1.md2`, which don't sit next to an identifiable
base model.

> This page reflects an ongoing reverse-engineering effort - see **Open questions** at the end
> of each section for what isn't nailed down yet. Every offset and rule stated as fact here has
> been checked against the game's full model data (over 2,300 files), not inferred from one or
> two examples.
>
> Items marked **(engine-confirmed)** were additionally checked against the original game's own
> pointer-relocation routine, which walks a freshly loaded `.md2` converting every stored file
> offset into an absolute pointer. What it relocates is a pointer and what it skips is not, and
> the counts and strides it loops with are the record sizes - so those are direct statements of
> the format rather than inferences from the data.

## Shared header

Every `.md2` file, mesh or animation, opens with the same header shape. Most of it is still
unidentified - the table below lists only the fields this project's parser actually depends on;
everything else is a gap of unknown content, not a claim that nothing is there.

| Offset | Size     | Description                                                                          |
| ------ | -------- | ------------------------------------------------------------------------------------- |
| 0x00   | 4 bytes  | Magic number - `46 5D D1 1C` (little-endian `0x1CD15D46`)                             |
| 0x04   | 4 bytes  | **Format version** - the engine requires `<= 0xDD` (engine-confirmed)                 |
| 0x08   | 4 bytes  | **Animation format version** - must be exactly `0xCB` or the animation block is discarded (engine-confirmed) |
| 0x30   | 1 byte   | Flags; bit 0 gates the whole mesh/material fixup pass (engine-confirmed)              |
| 0x36   | 2 bytes  | Frame/texture count                                                                   |
| 0x40   | 2 bytes  | Count for the table at 0xAC (engine-confirmed)                                       |
| 0x42   | 2 bytes  | **Total node count** - see **Target resolution** under Animation (engine-confirmed)   |
| 0x44   | 2 bytes  | Mesh count - the meshes are the *first* 0x44 of the 0x42 nodes                        |
| 0x48   | 2 bytes  | Count for the table at 0x7C (engine-confirmed)                                        |
| 0x4C   | 4 bytes  | Pointer, purpose unknown (engine-confirmed pointer)                                   |
| 0x50   | 4 bytes  | Frame table offset (see **Textures**, below)                                          |
| 0x54   | 4 bytes  | Frame data table offset (see **Textures**, below)                                     |
| 0x58 - 0x6C | 4 bytes each | Six pointers, purposes unknown (engine-confirmed pointers)                   |
| 0x70   | 4 bytes  | Mesh table offset - **0 marks this file as animation data**, see **Animation** below  |
| 0x74   | 4 bytes  | Transform-only node table - `(0x42 - 0x44)` records of 88 bytes - see **Node hierarchy** |
| 0x78   | 4 bytes  | Pointer, purpose unknown (engine-confirmed pointer)                                   |
| 0x7C   | 4 bytes  | Table of 0x48 records, 20 bytes each (engine-confirmed)                               |
| 0x80   | -        | Start of the model's overall bounding box (not yet parsed - see Open questions)       |
| 0x98   | 4 bytes  | Animation data block offset - animation files only, see **Animation** below           |
| 0xAC   | 4 bytes  | Table of 0x40 records, 16 bytes each (engine-confirmed)                               |

The engine relocates pointers at 0x4C, 0x50, 0x54, 0x58, 0x5C, 0x60, 0x64, 0x68, 0x6C, 0x70,
0x74, 0x78, 0x7C, 0x98 and 0xAC, so that whole run is a pointer block even where the purpose of
an individual entry is still unknown. It also writes its own base pointer to 0x9C and the raw
allocation to 0xB0 at load time, so those two are runtime scratch rather than file content.

### Open questions

- The meaning of the 0x0C field, and of the six pointers between 0x58 and 0x6C.
- The exact shape of the bounding box at 0x80 (min/max as two vectors, one vector plus extents,
  etc.) - its presence is inferred only from animation files never containing a float triple
  that reproduces it, not from having parsed it directly.

## Static meshes

A static mesh file has a non-zero mesh table offset at 0x70. Everything the mesh needs -
vertices, UVs, faces, materials, texture names - is reachable from the header fields above plus
the per-mesh table this section describes.

### Node hierarchy

**A model is a tree of nodes, not a flat list of meshes**, and a node's transform is relative to
its parent. Ignoring that leaves child meshes piled at the model origin.

The ushort at 0x42 is the total node count and the ushort at 0x44 the mesh count. The meshes are
the first `0x44` nodes, in the 160-byte records at 0x70; the remainder are **transform-only
nodes** in 88-byte records at 0x74. The engine indexes them with one rule (engine-confirmed):

```c
if (node < meshCount)  ptr = meshTable(0x70) + node * 0xA0;
else                   ptr = nodeTable(0x74) + (node - meshCount) * 0x58;
```

Both record kinds begin with the same header, which is what makes that work:

| Offset | Size     | Description                                                          |
| ------ | -------- | ---------------------------------------------------------------------- |
| 0x00   | 4 bytes  | Flags - bit `0x200` marks a transform-only node                        |
| 0x04   | 4 bytes  | **Parent** node (a file offset; 0 for a root)                          |
| 0x08   | 4 bytes  | **Next sibling** node                                                  |
| 0x0C   | 4 bytes  | **First child** node                                                   |
| 0x10   | 64 bytes | This node's transform, relative to its parent                          |
| 0x54   | 4 bytes  | Offset of the node's null-terminated ASCII name                        |

The three links are stored as file offsets into whichever of the two tables the target lives in,
so a reader converts an offset back to a node index by testing which table's range it falls in.
Bit `0x200` is how the engine tells the kinds apart - it skips material processing for any node
that has it set.

`Jun_isle.MD2` shows why this matters. Its three palm trees hang off two dummy nodes plus the
island mesh:

```
 0 Island     parent -            firstChild node[25]
25 l_tree1    parent mesh[0]      firstChild mesh[1]     local (-11.92, 8.99, 8.40)
    1 Box77   parent node[25]     sibling   mesh[2]      local (  0.00, 0.00, 0.00)
    2 Box78   parent node[25]                            local (  0.00, 0.00, 0.00)
26 l_tree2    parent mesh[0]      firstChild mesh[7]     local (  2.28, 14.88, 8.81)
    7 Box69   parent node[26]     sibling   mesh[8]      local ( -1.15, -1.83, 0.00)
    8 Box70   parent node[26]                            local (  0.00,  3.66, 0.00)
```

Two of the trees store their trunk and leaves at a local `(0, 0, 0)` and `(0, 3.66, 0)` - the
leaves are 3.66 units above *their trunk*, and mean nothing until `l_tree1`/`l_tree2` supply the
position. Read flat, those four meshes land on top of each other at the model origin.

Animation targets index this same node list, which is why a target can legitimately point past
the mesh count: it is naming a transform-only node. Rotating such a node should carry its whole
subtree.

> **Don't decompose these transforms into translation/rotation/scale.** About 1.7% of nodes in
> the game (130 of 7533) are *sheared* - their axes are not perpendicular - and a TRS cannot
> represent that, so the shear is silently dropped. `Jun_isle`'s tallest palm trunk is one of
> them, and decomposing skewed it more than 5 units out of place, into the dinosaur that stands
> next to it. Keep the 4x4 and multiply it.

### Textures

The frame table (offset at 0x50) is an array of *frame count* (0x36) 8-byte entries, immediately
followed by that many 20-byte null-padded ASCII texture filenames - one string per entry, in the
same order. A material's `FrameOffset` (see **Materials** below) is a byte offset that lands
inside this 8-byte-entry array; dividing `(FrameOffset - frameTableOffset)` by 8 gives that
material's index into it.

The frame data table (offset at 0x54) is a second, parallel array of *frame count* 16-byte
records, indexed the same way:

| Offset  | Size    | Description                                                             |
| ------- | ------- | ------------------------------------------------------------------------ |
| 0x00    | 4 bytes | Flags - bit 0 is tested by the engine (engine-confirmed)                 |
| 0x04    | 4 bytes | Zeroed at load time, so runtime scratch rather than file data (engine-confirmed) |
| 0x08    | 2 bytes | Padding                                                                  |
| 0x0A    | 2 bytes | Set to 1 by the engine under one load option (engine-confirmed)          |
| 0x0C    | 4 bytes | Offset of this frame's 20-byte texture filename string (engine-confirmed pointer) |

In practice this points at the very same filename strings that follow the frame table - the
two tables describe the same textures, reached two different ways. A material resolves its
texture name via the frame data table (`FrameNameOff`), not by reading the frame table's strings
directly.

A material's `FrameOffset` of exactly 0 is a sentinel meaning "no texture", not a real offset -
real offsets always start at the frame table's own offset.

A texture name that resolves to nothing is not an error. The engine searches two directories for
each name, logs `Could not load texture '%s' from '%s' or '%s'`, and then assigns the frame the
**first entry of the texture cache**, which the cache fills at startup with
`Data\Generic\defaulttexture\NotFound.tga` - a 64x64 brown noise tile (engine-confirmed). The
shipped data does rely on this: `Hal_isle.MD2`'s sign mesh names a `signgrab` texture that exists
nowhere in the game, and its frame draws as that brown tile rather than as anything the artists
authored.

The 8-byte frame table entries also begin with a **flags byte**: the engine tests bits `0x40`
and `0x80` of byte 0 and propagates them into the model-wide flags at header 0x30
(engine-confirmed).

That byte is the same one a material reads as its flags word - a material's `FrameOffset` points
at this entry, so the two are the same bytes reached from either direction. See
**Material flags** below for what is known of the individual bits.

#### Open questions

- The remaining 7 bytes of each frame table entry, and the frame data table's own flags field at
  0x00 beyond its bit 0 being tested.

### Mesh table

The mesh table (offset at 0x70) is an array of *mesh count* (0x44) fixed-size 160-byte records,
one per mesh:

| Offset | Size     | Description                                                              |
| ------ | -------- | ------------------------------------------------------------------------- |
| 0x00   | 4 bytes  | **Flags** - the engine tests `0x200` and sets `0x20`/`0x80000010` (engine-confirmed) |
| 0x04   | 12 bytes | Three pointers, purposes unknown (engine-confirmed pointers)              |
| 0x10   | 64 bytes | 4x4 transform matrix (16 floats, row-major) - this mesh's placement       |
| 0x50   | 4 bytes  | Unknown                                                                    |
| 0x54   | 4 bytes  | Offset of this mesh's null-terminated ASCII name                          |
| 0x58   | 2 bytes  | Vertex count                                                               |
| 0x5A   | 2 bytes  | Material count                                                             |
| 0x5C   | 2 bytes  | Face count                                                                 |
| 0x5E   | 2 bytes  | Vertex order length (see **Vertex order**, below)                         |
| 0x60   | 4 bytes  | Vertex data offset                                                         |
| 0x64   | 4 bytes  | Pointer, purpose unknown (engine-confirmed pointer)                        |
| 0x68   | 4 bytes  | UV data offset                                                             |
| 0x6C   | 4 bytes  | Material table offset                                                     |
| 0x70   | 4 bytes  | Face data offset                                                           |
| 0x74   | 4 bytes  | Unknown                                                                    |
| 0x78   | 12 bytes | Bounding box minimum (3 floats) - see **Vertex data**                     |
| 0x84   | 12 bytes | Bounding box maximum (3 floats) - see **Vertex data**                     |
| 0x90   | 4 bytes  | Unknown                                                                    |
| 0x94   | 4 bytes  | Vertex order table offset (see **Vertex order**, below)                   |
| 0x98   | 8 bytes  | Unknown                                                                    |

This mesh's bounding box (0x78/0x84) matters beyond just culling: it's also the box that
animation files quantise vertex positions into - see **Animation** below.

A node index below the model's mesh count selects one of these 160-byte records; a higher index
selects an 88-byte record from the table at header 0x74 instead (engine-confirmed) - see
**Target resolution** under Animation.

#### Open questions

- The remaining unknown fields (0x50, 0x74, 0x90, 0x98) and the three pointers at 0x04-0x0C -
  none have been narrowed down beyond "not used by anything this project's renderer needs".
- Which bits of the flags word at 0x00 mean what; only `0x200`, `0x20` and `0x80000010` are
  observed being tested or set.

### Vertex data

Vertex positions are **not** stored as one `(x, y, z)` triple per vertex. They're grouped into
batches of up to 4 vertices, and within a batch, stored axis-major: four X floats, then four Y
floats, then four Z floats. The vertex count is padded up to the next multiple of 4 for this
purpose (trailing padding vertices are read but discarded).

So for vertex count 5, the layout at the vertex data offset is:

```
X0 X1 X2 X3   X4 X? X? X?      (two batches of 4 X floats each - second batch mostly padding)
Y0 Y1 Y2 Y3   Y4 Y? Y? Y?
Z0 Z1 Z2 Z3   Z4 Z? Z? Z?
```

This is the *raw* vertex list, indexed by source vertex index. It is not the order the mesh is
actually drawn in - see **Vertex order**, next.

UV coordinates (at the UV data offset) use the same batches-of-4, axis-major layout, but the
count that matters here is the **vertex order length** (0x5E in the mesh record), not the raw
vertex count - UVs are stored per final, reordered vertex slot, not per source vertex.

### Vertex order

The vertex order table (offset at 0x94, length 0x5E) is an array of *vertex order length*
`ushort`s. Reading it produces the mesh's real, final vertex list: entry `i` of this table is
the source vertex index (into the raw vertex data above) that should become vertex `i` of the
drawn mesh.

This reordering exists to group vertices contiguously by material: each material record (see
below) gives a `StartIndex`/`EndIndex` range, and a final vertex `i` uses whichever material's
range contains `i`. So the vertex order table isn't just a remap - it's what makes each
material's vertices sit in one unbroken run, which is what lets a material be described by a
single index range instead of a vertex list of its own.

Face indices (see **Faces**, below) refer to this final, reordered vertex list - not the raw
vertex data.

#### Open questions

- Whether the vertex order table is ever used for anything beyond material grouping (e.g.
  triangle strips or fans) - not observed in the game's data so far.

### Faces

The face table (offset given in the mesh record) is *face count* records of 8 bytes each:

| Size    | Description                                          |
| ------- | ----------------------------------------------------- |
| 2 bytes | Unknown                                                |
| 2 bytes | Vertex index A (into the reordered vertex list)        |
| 2 bytes | Vertex index B                                         |
| 2 bytes | Vertex index C                                         |

Each record is one triangle. Winding order needs to be reversed from how it's stored to render
correctly with a standard right-handed culling convention.

#### Open questions

- The leading unknown `ushort` of each face record.

### Materials

The material table (offset given in the mesh record, *material count* entries) uses 16-byte
records:

| Size    | Description                                                          |
| ------- | ---------------------------------------------------------------------- |
| 4 bytes | Frame offset - see **Textures**, above (0 = no texture)                |
| 2 bytes | Unknown                                                                 |
| 2 bytes | Unknown                                                                 |
| 2 bytes | Start index - first reordered vertex index using this material         |
| 2 bytes | End index - last reordered vertex index using this material (inclusive)|
| 4 bytes | Unknown                                                                 |

A material with a non-zero frame offset also has a 4-byte flags word, read directly from that
frame offset in the file (i.e. the frame offset does double duty: it locates both the frame
table entry for the texture name, and a flags value sitting at that same byte offset).

### Material flags

Because that word is read *at* the frame offset, it is the first four bytes of the 8-byte frame
table entry described under **Textures** - and its low byte is the same "flags byte" whose `0x40`
and `0x80` the engine propagates into the model-wide flags at header 0x30.

That placement means **the word belongs to the texture as used by this model**, not to the
material alone: two materials in the same model naming the same texture necessarily share it.
Two *different* models naming the same texture need not, and 62 of the 2,990 textures referenced
across the game are flagged one way by one model and another way by another.

Measured across the 12,951 material uses in the game's 841 material-bearing mesh files:

| Bit    | Uses  | What is known                                                                   |
| ------ | ----- | --------------------------------------------------------------------------------- |
| `0x01` | all   | Set on every material in the game; carries no information                        |
| `0x02` | 2,621 | Marks a material meant to be drawn see-through - see below                        |
| `0x10` | 3,849 | Unknown. Independent of `0x20`                                                    |
| `0x20` | 3,886 | Unknown. Independent of `0x10`                                                    |
| `0x40` | 159   | Propagated into the model-wide flags at header 0x30 (engine-confirmed)            |
| `0x80` | 0     | Also propagated into header 0x30 (engine-confirmed), but no shipped material sets it |

The word never exceeds `0x73` anywhere in the game - only the low byte is ever used, and just 15
distinct values occur across all 12,951 uses. `0x10` and `0x20` are **not** a pair: they occur
alone 1,209 and 1,246 times respectively, and together 2,640 times.

#### Bit 0x02 - drawn see-through

This is the only bit whose meaning is established, and it is established from the data rather
than from the engine: nothing in the decompile reads it back where a render state is chosen.

It correlates with the texture declaring an alpha channel, but **only in one direction**. Of the
12,773 material uses whose texture could be resolved:

|                          | texture has alpha | texture has none |
| ------------------------ | ----------------- | ---------------- |
| **bit set**              | 2,247             | 335              |
| **bit clear**            | 1,780             | 8,411            |

So when the bit is set the texture has an alpha channel 87.0% of the time, but when a texture has
an alpha channel the bit is set only 55.8% of the time. It is not a restatement of the texture's
format - it reads as an authoring decision, "draw this one see-through", and a great deal of the
game's 32-bit art is deliberately drawn opaque. The largest groups carrying alpha without the bit
are ground and path tiles: `m_grass1`, `m_grass2`, `jfl_cnr2`, `jpa_que1`.

Compare against the texture header's **alpha-channel byte and not its bit depth**. The two are
different fields and they disagree: `sen_ant1` is stored 32-bit but declares no alpha channel.

> The percentages above carry a small caveat: 100 of the 3,385 distinct `.wct` names in the game
> appear in more than one WAD with different alpha-channel bytes, so a name-keyed lookup cannot
> be exact for those.

In the lobby - the one scene OpenTPW currently renders - the correlation is far tighter. Of the
232 material uses whose texture ships in `lobby.wad`, 224 agree. Six of the eight that disagree
are textures carrying alpha and drawn opaque anyway; the other two set the bit over a texture
with no alpha channel at all, one of them the lobby's own sea surface. Treating the bit as "draw
see-through" is what makes the islands' shoreline ripple rings and the Space island's antenna
cone render correctly.

What the bit does **not** distinguish is cut-out art from genuinely blended art. Most of what
carries it in the lobby is cut-out foliage - palm fronds, grass blades, bushes, the bats and
butterflies - which wants its alpha *tested*; only the ripple rings, the sea and the antenna cone
are true gradients. A renderer acting on this bit has to serve both.

#### Open questions

- The two unidentified 2-byte fields in the material record, and the 4-byte field at its end.
- What `0x10` and `0x20` select, and what `0x40` means beyond being propagated to header 0x30.
- Whether anything in the format distinguishes an alpha-tested cut-out material from a blended
  one, or whether the original engine drew both the same way.

### Normals

Vertex normals aren't stored in the file at all - they're computed by accumulating each
triangle's face normal onto its three vertices and re-normalizing, the usual smooth-shading
approach. There's no format detail here; it's purely a rendering choice.

## Animation

An animation file has a mesh table offset of **exactly 0** at 0x70 - the same field that's a
real pointer for static meshes. Animation files carry no vertex positions, texture names, or
mesh geometry of their own. Instead they carry a list of **tracks**, each posing one node of the
base model (identified by the shared filename prefix) over a range of authoring frames.

A track is not one kind of animation. It is a bundle of independent **channels** - a fountain's
water mesh morphs its vertices, scrolls its texture and carries a timing scalar all on the same
track - and each channel kind owns its own slot in the track descriptor. That is what makes the
format safe to read incrementally: a channel you don't understand costs nothing, because its
data lives in a slot you simply don't read.

Of the game's 1279 animation files, **1151 (90%)** carry at least one of the three channel kinds
documented below. A further 38 have a readable track table but carry only undecoded channels.
The remaining 90 contain no animation at all - 89 declare a track count of zero and one has no
animation block. **The track table identity never fails on any file in the game**, so nothing is
rejected for being unreadable.

### Locating the tracks

The uint at 0x98 points at a 72-byte **animation block**. That pointer is valid in 1278 of the
1279 animation files.

| Offset (from block start) | Size    | Description                                       |
| -------------------------- | ------- | --------------------------------------------------- |
| 0x08                        | 4 bytes | Last frame of the animation                         |
| 0x10                        | 2 bytes | Sum of every track's rotation keyframe count (a cross-check, not needed to parse) |
| 0x12                        | 2 bytes | Track count                                          |
| 0x2C                        | 4 bytes | Track table offset                                   |

The track table offset is trustworthy on its own terms, which matters because there's nothing
else to check it against: the table is exactly `trackCount * 64` bytes and **ends exactly where
the animation block begins**, i.e. `tableOffset + trackCount * 64 == blockOffset`. That identity
holds for 1189 of the 1279 files. A reader should apply it and treat a file that fails as
carrying no readable animation, rather than reading a table that isn't one.

### Track descriptors

Each track is a 64-byte descriptor:

| Offset (from descriptor start) | Size    | Description                                          |
| -------------------------------- | ------- | ------------------------------------------------------ |
| 0x00                               | 4 bytes | This track's own index (0-based, sequential - a validity check) |
| 0x04                               | 4 bytes | Channel flags - see below                              |
| 0x0C                               | 4 bytes | A frame value, close to but not always the track's last keyframe |
| 0x10                               | 2 bytes | Rotation keyframe count (channel `0x8` only)          |
| 0x14                               | 2 bytes | **Target node** - see **Target resolution** below      |
| 0x16                               | 2 bytes | Unknown, but **not** part of the target                |
| 0x18                               | 4 bytes | Data pointer for channel `0x1` (undecoded)             |
| 0x1C                               | 4 bytes | Rotation keyframes (channel `0x8`)                     |
| 0x20                               | 4 bytes | Pointer, channel unidentified (engine-confirmed)       |
| 0x24                               | 4 bytes | Pointer, channel unidentified (engine-confirmed)       |
| 0x28                               | 4 bytes | Vertex morph descriptor (channel `0x1000`)             |
| 0x2C                               | 4 bytes | UV animation descriptor (channel `0x10000`)            |
| 0x30                               | 4 bytes | Data pointer for channel `0x20000` (undecoded)         |
| 0x34                               | 4 bytes | Pointer, channel unidentified (engine-confirmed)       |

The flag word at 0x04 says which channels the track carries, and every bit owns exactly one
slot. Counted across every track in every animation file in the game:

| Flag bit    | Owns slot                     | Channel      | Tracks | Decoded? |
| ----------- | ----------------------------- | ------------ | ------ | -------- |
| `0x00008`   | count at +0x10, data at +0x1C | Rotation     | 3039   | Yes      |
| `0x01000`   | +0x28                         | Vertex morph | 1766   | Yes      |
| `0x10000`   | +0x2C                         | UV animation | 690    | Yes      |
| `0x20000`   | +0x30                         | Unidentified | 2536   | No       |
| `0x00001`   | +0x18                         | Unidentified | 1216   | No       |
| `0x80`+`0x100` | +0x20                      | Unidentified | 644    | No       |
| `0x00200`   | +0x24                         | Unidentified | 71     | No       |

Every one of those correspondences is **exact** - across all 1279 files, not one track sets a
bit without filling its slot or fills a slot without setting the bit. `0x80` and `0x100` always
appear together and share the single slot at +0x20.

There is an eighth pointer, at **+0x34, that no flag bit owns**. It is set on 1768 tracks and
every one of them is a rotation track (out of 3039), so it is an optional extra *for rotation*
rather than a channel in its own right. What it points at looks like a byte ramp -
`32, 66, 105, 141, 176, 208, 233, 249` in `Advisorm1` - which would be an easing curve, but the
records are not a fixed length and about a third are not monotonic, so that is an observation
rather than a decode.

> **Bit `0x4000` is a modifier, not a channel.** It makes the `+0x28` slot point at a different
> structure, and the engine branches on it *before* reading any morph table. Thirty tracks in
> the game set it, always alongside `0x1000`. Reading those as vertex morph follows offsets into
> the wrong structure, so a reader must exclude them.

> **The target at 0x14 is a ushort, not a uint.** 0x16 holds an unrelated value and is nonzero
> on 595 of the game's rotation tracks, so reading 32 bits there produces a garbage node index -
> large enough that a range check discards a track that was perfectly good.

### Target resolution

The target indexes the base model's **node** list, which for models with no extra hierarchy is
simply its mesh list. `Jun_gateM1.MD2` has two rotation tracks targeting nodes 0 and 1, which
are `Jun_gate.MD2`'s two door meshes.

The **total node count is the ushort at the model's 0x42**, and the meshes are only the first
`0x44` of those nodes. The engine indexes a node directly (engine-confirmed):

```c
if (node < meshCount)  ptr = meshTable(0x70) + node * 0xA0;              // 160-byte mesh record
else                   ptr = nodeTable(0x74) + (node - meshCount) * 0x58; // 88-byte node record
```

`Advisor.MD2` has 29 nodes and 25 meshes, which is why its animations reach node 28.

Across the game, **2967 of 2970 animation targets fall inside the node count** against only 2272
inside the mesh count - so a target above the mesh count is a real node the model simply has no
geometry for, not a misread. A reader with no representation for non-mesh nodes should skip
those tracks.

A range check alone is still not quite enough: a handful of targets land *within* the mesh list
on a mesh that clearly isn't the intended one (`droidm2.MD2` names a 16-vertex mesh while
carrying 3561 morph channels). For morph tracks there is a reliable second test, described
below.

### Rotation (bit 0x8)

Turns a whole node about its own origin. The keyframe count is the **ushort** at descriptor
0x10 and the data offset the uint at 0x1C. Each keyframe is 20 bytes:

| Size    | Description                                              |
| ------- | ----------------------------------------------------------|
| 2 bytes | Frame index                                                |
| 2 bytes | Flags - only `0x0000` and `0xFFFF` are observed; meaning unconfirmed |
| 4 bytes | Quaternion X                                               |
| 4 bytes | Quaternion Y                                               |
| 4 bytes | Quaternion Z                                               |
| 4 bytes | Quaternion W                                               |

Frame indices strictly ascend within a track, and every one of the 3039 rotation tracks in the
game decodes to a unit quaternion (within 0.01) at every keyframe. That pair of properties is
what a reader should validate before trusting a track.

Model space is Y-up, so a quarter turn about Y is a door swinging. `Jun_gateM1` takes the gate's
two doors from identity to a quarter turn, and `Jun_gateM2` is exactly the inverse - open, then
shut.

### Vertex morph (bit 0x1000)

Reshapes a mesh vertex by vertex. The slot at descriptor 0x28 points at a 16-byte descriptor:

| Offset  | Size    | Description          |
| ------- | ------- | ---------------------- |
| 0x02    | 2 bytes | Record count           |
| 0x0C    | 4 bytes | Record table offset    |

Each track has its **own** descriptor and its own channel space, so one animation morphs as many
meshes as it has morph tracks. 752 animation files carry readable morph tracks, 360 of them
more than one - `ratraceM1.MD2` morphs four meshes at once. There are 1766 morph tracks in all,
30 of which set `0x4000` and are skipped.

> Because each morph track is self-contained, a reader that only looks at a fixed header offset
> finds just the first one. Three of `ratrace`'s four morphing meshes have 64 vertices each, so
> matching a track to a mesh by vertex count cannot tell them apart either - the target index is
> the only thing that can.

Each record in the table is 20 bytes:

| Size    | Description                                                          |
| ------- | ---------------------------------------------------------------------- |
| 2 bytes | Keyframe count (`a`)                                                    |
| 2 bytes | Channel count (`b`)                                                     |
| 4 bytes | Offset of a `b`-entry array of channel IDs (`ushort` each)              |
| 4 bytes | Offset of an `a`-entry array of ascending frame indices (`ushort` each) |
| 4 bytes | Offset of an `a * b`-entry array of packed values                       |
| 4 bytes | Unknown                                                                 |

The channel ID and frame index arrays are each padded up to a 4-byte boundary, so the gap
between the channel IDs and the frame indices is `2*b` or `2*b + 2` bytes, and between the frame
indices and the values `2*a` or `2*a + 2`. A reader has to accept either.

The value array is **entry-major**: the value for keyframe `e` of channel slot `k` sits at
`valueOffset + (e * b + k) * 4` - all channels of keyframe 0 first, then all channels of
keyframe 1, not grouped by channel.

A morph track has exactly **one channel per vertex of its target mesh, plus two** trailing
channels that aren't vertices. 457 of the 464 tracks whose base model resolves satisfy that
exactly, and the 7 that don't are the mistargeted ones described under **Target resolution** -
which makes `channelCount == targetMesh.vertexCount + 2` a good validity test as well as a
description.

Channels the animation doesn't actually move are still present, in a record holding a single
keyframe of that channel's rest value, so a full mesh pose is always reconstructible by sampling
every channel.

**Value decoding.** Each 4-byte value is a vertex position quantised into three signed 10-bit
fields - X in bits 0-9, Y in 10-19, Z in 20-29 (bits 30-31 unused). Each field is a signed value
from -512 to 511 mapped linearly onto the *target mesh's* bounding box (from its mesh table
record): -512 is that axis's box minimum, +511 its maximum.

```
component(raw, shift, min, max):
    field = signed_10_bit((raw >> shift) & 0x3FF)
    centre = (min + max) / 2
    return centre + field * (max - min) / 1023
```

Verified to R² >= 0.999997 per axis (max error ~0.028 units, exactly the quantisation step) by
decoding every channel's rest keyframe and comparing against a known mesh's actual vertices.

### UV animation (bit 0x10000)

Slides texture coordinates - this is how the game animates water. The slot at descriptor 0x2C
points at a 20-byte descriptor:

| Offset  | Size    | Description                                |
| ------- | ------- | -------------------------------------------- |
| 0x00    | 4 bytes | Entry count `n`                              |
| 0x04    | 4 bytes | Offset of the index table                    |
| 0x08    | 4 bytes | Total component count `c`                    |
| 0x0C    | 4 bytes | Offset of the duration table                 |
| 0x10    | 4 bytes | Offset of the value table                    |

The three tables are contiguous, in the order index, value, duration, and exactly sized by those
two counts:

- **Index table**, `n * 4` bytes: per entry, a ushort first component and a ushort component
  count. UV components are two per coordinate, so an entry covering a whole UV is `(2i, 2)`.
- **Value table**, `c * 8` bytes: per entry, its component count of start floats followed by the
  same number of end floats. So a 2-component entry is `(u_start, v_start, u_end, v_end)`.
- **Duration table**, `n * 4` bytes: per entry, a ushort pair whose **high** half is the end
  frame.

All 690 UV channels in the game satisfy every one of those invariants - the per-entry component
counts sum to the stated total, and both `indexTable + 4n == valueTable` and
`valueTable + 8c == durationTable` hold without exception.

A channel that animates every UV of its mesh has the identity index table `(2i, 2)` with `n`
equal to the mesh's **vertex order length** (the UV count, not the vertex count). One that
animates a subset names the components it wants - `arcadeM1`'s `screen` mesh animates 6 entries
out of 53 UVs.

`Jun_isleM1.MD2` is a clear worked example: it scrolls all 128 of `Post Ripples01`'s UVs by
`(-1, -1)` over 100 frames, and 104 of the `Island` mesh's 298 UVs by the same delta - the
shoreline foam lapping the beach, with the rest of the island held still.

An entry has no start frame: it always ramps from the beginning of the animation to the end frame
its duration table names. That makes the duration table the **only** statement of how long a
UV-only animation runs, which is worth saying outright, because rotation and vertex morph both
carry explicit frame indices and UV does not. `Fan_isleM1` and `Hal_isleM1` scroll water and do
nothing else; work an animation's length out from its rotation and morph keyframes alone and
those files span zero frames, so their water never moves. 98 of the game's 1151 animation files
are in that position.

### Sequencing

Nothing in the format says how a model's `M1`, `M2`, ... animations are ordered, when they
should play, or whether they loop. A gate's "doors open" and "doors close" are just two files,
indistinguishable by anything in the `.md2` data. In the original game this is driven externally,
by a `TRIGANIM` instruction in that ride's [compiled script](/formats/rsse) - see the gate
example on the [RSS](/formats/rss) page.

### Open questions

- The channel at flag `0x1` (pointer at descriptor +0x18). Partially characterised: it leads to
  a repeating record of `u32 tag, u16 a, u16 b, ptr, ptr`, where the second pointer is clearly a
  frame index array (`0, 10, 20, 30` in `Advisorm14`) and the first is an `a * 12`-byte payload.
  The record shape only holds for about 58% of instances, so there are variants and this is not
  decoded.
- The channel at flag `0x20000` (pointer at descriptor +0x30) - location known, contents not.
- The three further pointer slots at +0x20, +0x24 and +0x34, and which flag bits own them.
- The frame-ish value at descriptor +0x0C, and the unknown 4 bytes ending each morph record.
- What the two extra channels beyond a morph track's vertex count represent.
- Why a few models' target indices don't land on the mesh the data clearly belongs to - i.e.
  what the node list actually contains for models that have more nodes than meshes.
- The 90 animation files that fail the track table identity, and the 25 that pass it but carry
  only the undecoded channel kinds.
