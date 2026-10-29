---
title: Sound category maps (*.map)
---

Category banks and sound definitions are stored in paired `BANK.map` and `SFX.map` files. Integers are little-endian. The layout below follows the Traditional Chinese `TP.exe` category loader at `0x6ba210`–`0x6ba6e5`.

## Header

| Offset | Size | Description |
| --- | --- | --- |
| 0x00 | 16 | Binary signature: BANK `012c61e9d031d211b40900a0c993f203`; SFX `002c61e9d031d211b40900b0c993f203` |
| 0x10 | 4 | SFX weight mode: zero stores cumulative definition weights |
| 0x14 | 4 | Other header data |
| 0x18 | 4 | Bank count or sound group count |

## BANK.map

Following the header are `count` records of 11 bytes, then `count` strings. Each string is a 32-bit byte length followed by that many bytes, including the terminating zero. The ASCII path is an SDT stem relative to the category parent directory. The 11-byte records have not been fully identified.

## SFX.map

The header is followed by `group count` records of 24 bytes. At offset 0 each contains a 32-bit sound count. For each group, `sound count` 20-byte sound records follow, and each sound's definition and nested tables follow in file order.

| Sound record offset | Type | Meaning |
| --- | --- | --- |
| 0 | u32 | Sound ID |
| 4 | u32 | Definition count |
| 12 | u32 | Priority |
| 16 | u16 | Flags |

Each sound is followed by its 42-byte definition records. Each definition is then followed by its sample array and relation array.

| Definition offset | Type | Meaning |
| --- | --- | --- |
| 0 | u16 | Sample count |
| 4 | u32 | Relation count |
| 12, 13 | u8 | Minimum and maximum volume |
| 16, 18 | u16 | Minimum and maximum delay |
| 30 | u32 | Weight, cumulative when header offset 0x10 is zero |

A sample record is 16 bytes: ID (u32), threshold (u32), duration in milliseconds (u32), bank (u16), flags (u16). The bank and sample ID are one-based; zero denotes an unbound reference (Traditional Chinese `0x6ba5f1`). An 8-byte relation contains a one-based definition reference and a parameter word, both u32. Unlisted bytes remain unidentified.
