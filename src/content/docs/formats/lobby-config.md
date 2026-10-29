---
title: Lobby configuration
---

The lobby archive contains `lobby.txt` and the four theme files `jungle.txt`, `fantasy.txt`, `hallow.txt` and `space.txt`. Their contents are function-style commands rather than SAM key/value pairs. The commands below were checked against all five files in the US release and the `LobbyConfig` reader.

The shipped files use `NAME(argument, ...)`, quoted strings, decimal numbers and optional semicolons. The OpenTPW reader also accepts `#` and `//` line comments and parses numbers independently of the system locale.

## Lobby commands

| Command | Arguments |
| --- | --- |
| `ISLANDCAMERAPOSITION` | island ID, X, Z |
| `ISLANDFOV` | field of view in degrees |
| `SPINSPEED` | spin rate in retail time units |
| `SPINRADIUS` | radius |
| `VERTICALOFFSET` | vertical offset |
| `GLOBERADIUSOUT`, `GLOBERADIUSIN` | radius |

## Theme commands

| Command | Arguments |
| --- | --- |
| `ISLAND` | numeric ID, resource directory, island model name, gate model name, name, rotation in degrees, height |
| `FLYINGMESH` | resource directory, model name, count, X extent, Y extent, Z extent, speed |
| `SKYCOLOUR` | red, green and blue components, 0–255 |
| `LIGHTNING` | integer value |
| `RAINY` | integer flag |

Resource paths may use backslashes and a leading `data/`; model paths append `.md2` to the corresponding resource directory and model name. Unknown commands and duplicate island IDs are rejected by the current reader.

