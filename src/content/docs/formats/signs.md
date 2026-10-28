---
title: Lobby signs (*.sgn)
---

A sign definition accompanies the model with the same basename. The layout below is the version 101 reader, based on Traditional Chinese `TP.exe` `0x5e6f40`. Integers and floats are little-endian.

## Header

| Offset | Type | Meaning |
| --- | --- | --- |
| 0x00 | i32 | Version, 101 |
| 0x04 | i32 | Text line order |
| 0x08 | u8 | Background present |
| 0x09 | i32 | First line shadow mode |
| 0x0d | i32 | Second line shadow mode |

## Line records

Two records follow the header, each 436 bytes. Offsets are relative to the beginning of a record.

| Offset | Type | Meaning |
| --- | --- | --- |
| 0 | 64 bytes | Zero-terminated font face name |
| 64 | 260 bytes | Zero-terminated font filename |
| 324 | i32 | Character spacing percentage |
| 328 | i32 | Top Y in the 512×512 sign image |
| 332 | 60 bytes | Raw LOGFONT data |
| 392 | i32 | Bevel |
| 396 | 8 × f32 | Depth, blur, ambient, diffuse, specular, power, azimuth and elevation |
| 428 | 2 × i32 | Cached height and top |

The final two integers occupy offsets 428 and 432. The filename `simyou.ttf` selects GB2312 for the face name in the reader; other known assets use Big5. A font's localized family aliases may identify the same font face.

After the two records, each line with a non-zero mode has a 20-byte style record. Two pattern images follow, each with i32 width, height and channel count (4), then width × height ARGB bytes. Their precise style fields are not completely identified.

## Embedded background

The embedded descriptor has i32 width, height, and channels (4), four f32 quantization factors, then i32 colour and alpha compressed sizes. The compressed background begins with `BILZ`; it uses packed-row coefficients as in WCT type `0x12`. The two `sign1` and `sign2` materials use halves of the resulting 512×512 image. The descriptor is located by validating its signature and sizes rather than assuming a fixed offset.

