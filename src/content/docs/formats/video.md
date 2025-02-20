---
title: Video (*.tqi)
---

> This page is a work in progress.

Note: some of the information here has been taken from <https://wiki.multimedia.cx/index.php/Electronic_Arts_Formats>.

## What is TQI?

Much like DK2, Theme Park World uses the TQI video codec and SHI/PT/adpcm_ea audio codec, wrapped in the TGQ format / file extension. All movies are playable through the [EA uV/uV2 Video Player](https://lubiki.keeperklan.com/html/dk2_tools_other.php).

EA multimedia formats are comprised of a series of blocks with the following format:

```text
bytes 0-3    block type 'Four Character Codes' (FourCC)
bytes 4-7    block size (including this 8-byte preamble)
bytes 8..    block payload
```

It is important to note that there is no consistent byte order for multi-byte numbers. However, the order is optimized for the target platform, i.e. little-endian for PC/PS/XBOX and big-endian for Mac/Saturn/GameCube.

### TPW/STP Chunk Types

* Audio
  * EA SCxl: SCHl, SCCl, SCDl, SCLl, SCEl, and SHEN, SCEN, SDEN, SEEN
* Video
  * EA TQI: pIQT, (rumored UV2f?)

In addition to FMV, the EA audio chunk types are frequently used throughout Electronic Arts games for music tracks, audio effects, and speech. Older titles use the .ASF file extension for individual music tracks, whereas newer titles store multiple audio tracks sequentially within the one file (hence rationale for the ending chunk types) and use a variety of file extensions.
