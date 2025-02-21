---
title: Strings (*.dat, *.str)
---

## Encoding

Strings are converted from Unicode to Bullfrog Multibyte format using two files: `MBtoUNI.dat` (converting from Multibyte to Unicode) and `UNItoMB.dat` (converting from Unicode to Multibyte).
The contents of this file may differ depending on the language that is being used and depending on which characters are required.  The offset of each of these characters is then specified within a BFST file.

### File Format

**Header**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 4 bytes            | Magic number - "BFUM"                                                          |
| 2 bytes            | Likely specifies the character encoding - usually 0x09                         |
| 2 bytes            | Character count                                                                |

**For each character**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 2 bytes            | The character itself in either Unicode or multibyte form                       |

## Storage

The Bullfrog String file format (*.str) is used in order to store localized strings for in-game text.
These don't have any specific character encoding - they use the two aforementioned file formats to convert to and from 'Bullfrog Multi-byte' characters.

### File Format

**Header**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 4 bytes            | Magic number - `BFST`                                                          |
| 4 bytes            | Unknown                                                                        |
| 4 bytes            | String count                                                                   |

**String Directory**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 4 bytes            | String offset (from the end of the string count)                               |

**For each string (at offset)**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 1 byte             | Unknown - always `01`                                                          |
| 3 bytes            | String length                                                                  |
| *n* bytes          | Characters in BFMU format                                                      |
| 4 bytes            | Padding                                                                        |
