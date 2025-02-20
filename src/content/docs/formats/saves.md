---
title: Saves (*.tpws, *.ints, *.lays)
---

Theme Park World stores saves with three different extensions.

These extensions are:

- **TPWS**: Standard save
- **INTS**: Initial save (e.g. for *Instant Action* mode)
- **LAYS**: Online save (for uploading parks)

## File format

**Header**

| Size      | Description                  |
| --------- | ---------------------------- |
| 4 bytes   | Magic number - `F4 01 00 00` |
| 823 bytes | Copyright Notice             |
| 711 bytes | Padding                      |

**File info**

| Size    | Description                                     |
| ------- | ----------------------------------------------- |
| 4 bytes | File type - `00 01 22 19`                       |
| 1 byte  | File version - `85`                             |
| 1 byte  | Online flag - `00` for offline, `01` for online |
| 2 bytes | Padding                                         |

**Data (compressed using ZLIB)**

| Size     | Description           |
| -------- | --------------------- |
| 4 bytes  | Magic number - `BILZ` |
| 4 bytes  | Unknown               |
| 4 bytes  | Compressed length     |
| 16 bytes | Unknown               |

The ZLIB stream begins after this point, and continues to the end of the file.
