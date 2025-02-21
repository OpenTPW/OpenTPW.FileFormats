---
title: Archives (*.wad)
---

The Bullfrog WAD file format contains compressed (or uncompressed) data for rides, textures, UI elements, and more.

The data within these files is typically compressed using [RefPack](http://wiki.niotso.org/RefPack) (see below).

### File Format

**File header**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 4 bytes            | Magic number - "DWFB"                                                          |
| 4 bytes            | Version                                                                        |
| 64 bytes           | Padding                                                                        |
| 4 bytes            | File count                                                                     |
| 4 bytes            | File list offset                                                               |
| 4 bytes            | File list length                                                               |
| 4 bytes            | Padding                                                                        |

**For each file**

| Size               | Description                                                                    |
|--------------------|--------------------------------------------------------------------------------|
| 4 bytes            | Unknown                                                                        |
| 4 bytes            | Filename offset                                                                |
| 4 bytes            | Filename length                                                                |
| 4 bytes            | Data offset                                                                    |
| 4 bytes            | File length                                                                    |
| 4 bytes            | Compression type - "4" for [RefPack](http://wiki.niotso.org/RefPack), "0" for uncompressed|
| 4 bytes            | Decompressed size                                                              |
| 12 bytes           | Padding                                                                        |

**Directories**

Occasionally, a file's filename may begin with the name of a directory separated using the `\` character. This should
be treated as entering a directory, meaning that file and any further files all belong to that folder.

For example:

| File #    | Filename                  |
|-----------|---------------------------|
| 0         | hello.sam                 |
| 1         | hello.RSE                 |
| 2         | textures\\hello.wct       |
| 3         | hello2.wct                |
| 4         | stexture\\hello.wct       |
| 5         | hello2.wct                |

Here:
- Files 0 and 1 both belong to the root of the archive
- Files 2 and 3 exist in the `textures` directory
- Files 4 and 5 belong to the `stexture` directory.
 
Despite file 3 and file 5 both being called `hello2.wct`, they do not overlap - they belong in different directories - and therefore they do not conflict. 
