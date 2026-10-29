---
title: Player profiles (gms.dat)
---

A player's `save/users/<player>/gms.dat` contains a version 12 profile. All integers are little-endian. The structure follows Traditional Chinese `TP.exe` `0x5ac370`, `0x5ad180`, `0x423980`, and the US preference serializer `0x423e90`.

| Order | Type | Meaning |
| --- | --- | --- |
| 1 | u32 | Version, 12 |
| 2 | 17 bytes | Prefix, including award flags, key count and creation mode |
| 3 | u32 | Segment count |
| 4 | variable | Segment records |
| 5 | 39 bytes | Preferences |
| 6 | u32 | Ride ID count |
| 7 | count × u16 | Ride IDs |

Each segment has a u32 name length, that many Latin-1 bytes, and 160 bytes of segment data. Unidentified fields should be retained verbatim.

## Prefix and segments

The prefix's first six bytes and each theme segment's first six bytes hold award flags. The signed 32-bit value at prefix offset 10 holds extra keys; prefix byte 14 is the creation mode. Within each 160-byte theme segment, offsets 26 and 28 start two interleaved arrays of 33 UTF-16 code units, one code unit per line every four bytes; byte 158 is the name-changed flag. US `0x5b0d70` serializes these arrays.

## Preferences

Four eight-byte enabled/volume pairs occur in order: effects, music, speech and movie. Each pair contains a four-byte enabled field (only the first byte has known meaning) and a u32 volume, 0–100. Seven single-byte flags follow at offsets 32–38: advisor, tutorial, tooltips, confirm delete, right-mouse scroll, right-mouse cancel and isometric. Preserve unknown padding in the enabled fields.
