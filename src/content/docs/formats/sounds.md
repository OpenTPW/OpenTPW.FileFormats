---
title: Sound Data (*.sdt)
---

SDT is an archive format that contains one or many MPEG-2 Audio Layer II (`*.mp2`) files that are used for sound effects, speech, and music throughout the game.  These files are usually uncompressed (in the archive), and the archive format is relatively simple.

### File Format

**Header**

| Size    | Description |
| ------- | ----------- |
| 4 bytes | File count  |

**For each file**

| Size    | Description |
| ------- | ----------- |
| 4 bytes | File offset |

**For each file with a header size of at least 48 bytes (at offset)**

| Size     | Description                         |
| -------- | ----------------------------------- |
| 4 bytes  | Header size                         |
| 4 bytes  | Data size                           |
| 16 bytes | File name (usually null terminated) |
| 4 bytes  | Sample rate                         |
| 4 bytes  | Resolution                          |
| 4 bytes  | Sound type (see below)              |
| 4 bytes  | Unknown                             |
| 4 bytes  | Samples                             |
| 4 bytes  | Unknown                             |
| n bytes  | File data                           |

**Sound Types**

* 0: None
* 2: WAV
* 3: "Old WAV" (see <https://github.com/ufdada/dk2-tools/blob/master/Formats/Sound/sdt_struct.bt>)
* 36: MP2, 64kbps mono
* 37: MP2, 112kbps stereo
### Retail 40-byte headers

The 40-byte variant packs sample rate as a little-endian u16 at offset 0x18, followed by one-byte resolution and sound type at 0x1a and 0x1b. The three remaining u32 fields start at 0x1c. The table above describes the larger variant of at least 48 bytes, with 32-bit rate, resolution and type. In either variant the MPEG data starts at `file offset + header size`, not after a fixed-size structure. This distinction is supported by the retail data and the `SoundFile.GetFile` reader.

Entry name matching is case-insensitive: for example, the Traditional Chinese `SP_465.mp2` and US `sp_465.mp2` refer to the same sample name. The OpenTPW reader accepts a case-insensitive prefix when locating an SDT entry.
