---
title: Sprite textures and sequences (*.tpc, *.esp)
---

The TPC loader and row decoder are documented by Traditional Chinese `TP.exe` `0x584320`, `0x584bd0` and `0x560db0`. Integers are little-endian.

## TPC texture

| Offset | Type | Meaning |
| --- | --- | --- |
| 0 | u16 | Pixel format, 3 |
| 2 | u16 | Variant |
| 4 | i32 | Frame count |
| 8 | 256 × u32 | Packed palette entries |

Each frame follows in order: encoded byte count (i32), width and height (u16 each), display width and height (u16 each), X and Y offsets (i32 each), followed by the encoded bytes. Each row begins with one byte giving the encoded row length, excluding that length byte. Packets use a signed byte: a positive value copies that many literal palette indices; a non-positive value repeats the next index `abs(value)` times. Rows decode to the frame width.

## ESP sequence descriptors

The sequence loader is Traditional Chinese `0x53d3b0`. Supported descriptors are 334 or 350 bytes.

| Offset | Size | Meaning |
| --- | --- | --- |
| 0 | 12 | ASCII signature `ESP_FILE2.00` |
| 12 | 256 | Zero-terminated texture name, e.g. `SPR_PA.TPS` |
| 268 | 2 | Header flags, meaning not yet established |
| 270 | 16 × 4 | Sequence descriptors |
| 334 | 0 or 16 | Optional trailing metadata, meaning not yet established |

Each descriptor is a u16 first frame, u8 frame count and u8 directional flag. For a directional sequence, the selected texture frame is `first + frame + frameCount * (direction & 7)`; otherwise it is `first + frame` (Traditional Chinese `0x53e9d0`).
