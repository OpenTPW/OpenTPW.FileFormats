---
title: Saves (*.tpws, *.ints, *.lays)
---

Theme Park World stores saves with three different extensions.

These extensions are:

- **TPWS**: Standard save
- **INTS**: Initial save (e.g. for *Instant Action* mode)
- **LAYS**: Online save (for uploading parks)

Levels also ship start files, `levels/<level>/Easymode.TPWI`, in the same format.

The layout below was checked on:

- the Jungle `Easymode.TPWI` of the English (European), Traditional Chinese and Simplified Chinese
  releases;
- a Simplified Chinese autosave and restart point;
- eleven saves from a later build (build stamp March 17 2000), covering all four levels.

Every one of them ends each module exactly on its tag, and the data ends exactly after the last
module. Addresses refer to the Traditional Chinese `TP.exe` (built 1999-11-16).

## File format

**Header**

| Offset  | Size    | Description                                                                 |
| ------- | ------- | --------------------------------------------------------------------------- |
| `0x000` | 4 bytes | `0x190` (`90 01 00 00`) in the 1999 releases; `0x1F4` (`F4 01 00 00`) in the March 2000 build |
| `0x004` |         | Copyright notice, then padding up to `0x604`                                |

**File info**

| Offset  | Size    | Description                                     |
| ------- | ------- | ----------------------------------------------- |
| `0x604` | 4 bytes | File type - `00 01 22 19`                       |
| `0x608` | 1 byte  | File version - `85`                             |
| `0x609` | 1 byte  | Online flag - `00` for offline, `01` for online |
| `0x60A` | 3 bytes | Padding                                         |

**Data (compressed using ZLIB)**, from `0x60D`

| Size     | Description           |
| -------- | --------------------- |
| 4 bytes  | Magic number - `BILZ` |
| 4 bytes  | Unknown               |
| 4 bytes  | Compressed length     |
| 16 bytes | Unknown               |

The ZLIB stream begins after this point, and continues to the end of the file. It inflates to
about 1.6 MB.

## Decompressed data

The data is a sequence of **modules**, read by `0x414FF0` in the order below. There are no field
names or sizes in the file (the name argument of the per-field helper `0x416AB0` is unused), so
every module has to be read field by field the way the game does.

All but the first and last module end with a 4-byte **tag**, which the game checks ("The ... module
did not load the same number of bytes that it saved"). The tag is a FourCC stored little-endian, so
`WRLD` appears in the file as the bytes `DLRW`.

| #  | Module         | Loader     | Tag    |
| -- | -------------- | ---------- | ------ |
| 1  | GActionRec     | `0x403720` | -      |
| 2  | World          | `0x5143B0` | `WRLD` |
| 3  | Scripts        | `0x4739F0` | `SPSC` |
| 4  | Particles      | `0x51BEC0` | `PART` |
| 5  | MsgCntr        | `0x40FCF0` | `MESS` |
| 6  | Clock          | `0x402DC0` | `CLOK` |
| 7  | VanillaTime    | `0x4031F0` | `VANT` |
| 8  | GameSystem     | `0x54CCB0` | `GSYS` |
| 9  | RideSystem     | `0x4633A0` | `RSYS` |
| 10 | TrackRides     | `0x53FB90` | `TRAK` |
| 11 | FlyingRides    | `0x55A650` | `FLYR` |
| 12 | RSSE           | `0x555DF0` | `RSSE` |
| 13 | Camera         | `0x42C830` | `KAME` |
| 14 | Coasters       | `0x436EB0` | `COAS` |
| 15 | Advisor        | `0x5961B0` | `ADVS` |
| 16 | Sound          | `0x518BB0` | `SOUN` |
| 17 | Cheat          | `0x4055A0` | `CHTS` |
| 18 | AdvisorScoring | `0x598D00` | `ADSC` |
| 19 | UI             | `0x47F960` | -      |

GActionRec is a 4-byte published-park flag, a 4-byte size and that many bytes of recording.

### World

The park itself. In order:

| Size  | Contents |
| ----- | -------- |
| 64    | Header - see below |
| 4806  | Object controls: 150 × 32 bytes, then 4 bytes and 2 bytes |
| 670   | Staff pool: 32 candidates of 20 bytes, then 5 × (4 bytes people in category, 1 byte stop producing), 4 bytes time signature, 1 byte opening pool generated |
| 28    | Game time: 8 bytes funny time start, 8 bytes session start, 4 bytes month, 4 bytes day, 4 bytes funny seconds per real second |
| 18    | Visitor arrival: 4 bytes rate, 4 bytes time signature, 4 bytes target vehicle capacity, 4 bytes people on bus, 1 byte offloading, 1 byte gates open |
| ...   | 128 × 128 map cells, row by row |
| ...   | Things |

**Header** (64 bytes): 4 bytes version (`2`); 2-byte arrival vehicle sizes ×3, bank account id,
current arrival vehicle id; 4 bytes game tick; 2-byte mechanic HQ id, park analyser id; 4 bytes park
closed; 4 bytes visitors to date; 2-byte park gates id, traffic lights id; 4 bytes random seed;
2-byte research lab, staff HQ, tag system, UI message receiver and weather ids; 4 bytes world state;
2-byte first handyman, mechanic, entertainer, guard, researcher and object ids.

The ids name things in the thing list below. The park gates and traffic lights are objects (type
1601 and 1603); the current arrival vehicle is the bus (1600).

**Game time**: the month counts from 0 (January) and the day from 1. Later saves hold `9/31` and
`0/31`, and `1/29` is 29 February 2000. A restart point saved before the first calendar update holds
month 0 and day -1.

#### Map cells

Each cell starts with a byte saying which parts are present, then each present part:

| Bit | Size     | Part |
| --- | -------- | ---- |
| 0   | 52 bytes | Cell base, then 4 bytes litter, 2 bytes litter collector, 2 × 4 bytes litter script, 2 bytes pylon index, 1 byte status flags, 4 bytes time marked for litter collection, 2 bytes |
| 1   | 31 bytes | Cell base, then 2 bytes segment number |
| 2   | 10 bytes | 5 × 2 bytes |

The cell base is 29 bytes: 1 byte direction, 2 bytes flags, 4 bytes mesh instance, 1 byte
neighbours, 2 bytes overlap counter, 2 bytes parent id, 12 bytes tile data, 4 bytes type, 1 byte
hoarding neighbours. Types seen: 7 outside the park, 0 empty ground, 1 path, 2 water, 4 object
footprint, and also 3, 9, 10 and 30. The saves checked only have parts `3` or `7`.

#### Things

Everything in the park - visitors, staff, rides, and the park-wide singletons - is a **thing**. They
form a list linked by id: 4 bytes id of the first thing, then for each thing 4 bytes id of the next
(0 ends the list), 4 bytes model, and the model's data. Ids usually count down but not always (the
European `Easymode.TPWI` goes 29, 15, 28, ...), so follow the next ids.

Every model's data starts with 2 bytes X, 2 bytes Y (256 per cell, 128 is a cell's centre), 2 bytes
map child and 2 bytes map parent.

| Model | Thing                        | Size                     | Notes |
| ----- | ---------------------------- | ------------------------ | ----- |
| 1     | Visitor                      | 525                      | Person base (390) and its own fields |
| 3     | Object (ride, shop, feature) | 371 + 4 × history entries | Below |
| 4     | Mechanic                     | 503                      | Person and staff base (495) and its own fields |
| 5     | Handyman                     | 505                      | |
| 6     | Entertainer                  | 501                      | |
| 7     | Guard                        | 503                      | |
| 8     | Researcher                   | 501                      | |
| 9     | Staff HQ                     | 95                       | Strike state and budgets |
| 10    | Mechanic HQ                  | 10                       | |
| 11    | Advisor                      | 5838                     | 351 × 16-byte history, 9 × 21-byte messages |
| 12    | Tag system                   | 8                        | |
| 13    | Park analyser                | varies                   | Below |
| 14    | Research lab                 | 4182                     | 256 × 16-byte projects, 5 × 13-byte groups |
| 15    | Weather                      | 91                       | |
| 16    | Bank account                 | 292                      | 4 bytes admission fee, 4 bytes balance, ... 8 × 32-byte loans |
| 17    | UI message receiver          | 8                        | |
| 19    | Challenges                   | 929                      | 20 × 45-byte challenges |

A **history** is 4 bytes current entry, 4 bytes entry count, 1 byte wrapped around, a temporary
value, then entry count values.

**Object** (model 3, loader `0x4D8E20`), after the 8 bytes every thing starts with:

- 4 bytes angle (0, 90, 180 or 270); 2 bytes type id - the `Info.Id` of its [`.sam`](/formats/sam/);
  8 × 4 bytes; 4 bytes mesh instance; 2 bytes flags; 33 × (2 bytes, 2 bytes) names.
- 4 bytes each: ride script handle, track ride handle, state.
- 2 bytes each: top left cell, entrance cell (cell index = y × 128 + x), next, assigned staff member,
  back of queue.
- 4 bytes can load; 2 bytes exit; 2 bytes first in queue; 4 bytes track ride valid; 2 bytes upgrade
  parent.
- 2 histories (4-byte temporary and values); 4 bytes customer count; a history; 4 bytes walk aways;
  3 histories.
- 1 byte operating capacity, 1 byte operating duration, 4 bytes operating speed, 2 bytes person
  being loaded.
- 4 bytes each: cost of goods, quality of goods, chance of winning, price per use, special
  ingredient, queue size; then 3 × 4 bytes.
- 4 bytes each: requested service, time marked for maintenance, total costs, total takings, upgrade
  balloon sprite.
- 1 byte upgrade level.

In the saves checked, every object's type id is a level's `.sam` `Info.Id`.

**Park analyser** (model 13, loader `0x4C35D0`), after the 8 bytes every thing starts with:

- 5 × 4 bytes (map squares per cell, grid and map sizes); 1024 grid cells of 61 bytes.
- 4 histories of 2-byte values (2-byte temporary); 6 × 5 bytes; 18 histories of 4-byte values
  (4-byte temporary); 20 histories of 1-byte values (1-byte temporary).
- 4 bytes each: misbehaving kids, that got away, misbehaving kids ever, lifetime visitors.
- 6 × 8-byte times of last events; 3 × 4 bytes records.

The game's loader reads "misbehaving kids ever" through its write helper, but it still takes 4
bytes.

### Modules after World

"Inferred" marks what the game's loaders do not say and was worked out from the data.

| Module | Layout |
| ------ | ------ |
| Scripts | `SCPT` (stored `TPCS`), 4 bytes `0x118`, 4 bytes slot count (100), slot count × 4-byte pointers (only zero or non-zero matters), then `0x118` bytes for each non-zero slot except slot 0 |
| Particles | `PTCL` (stored `LCTP`), 4 bytes saved flag; if set: 4 bytes `0x9E68` and that many bytes, 4 bytes `0x8B60` and that many bytes, 4-byte size and that many bytes |
| MsgCntr | 4 bytes, then 29 queues of 4 bytes count and count × 2-byte message ids |
| Clock | 2 × 4 bytes, in milliseconds |
| VanillaTime | 4 bytes, milliseconds relative to the machine timer when saved |
| GameSystem | 9 × 4 bytes; the first three are times close to the Clock values |
| RideSystem | 4-byte size, then a block: 3 × 4 bytes slots in use; per slot a 1-byte present flag, and for present slots `0x37` bytes (4 bytes type id at +1; 4 bytes each cell X, Y, width, height, kind, handle, flags; angle at +0x23; 2 bytes node count at +0x2B; 2 bytes embedded node count at +0x2D), then 8 bytes per embedded node, 4 bytes per node, and 44-byte animation time controls. How many time controls a ride has is **inferred**: the one count that makes every record end on the block's end (1 for most rides, 3 for type `1303`) |
| TrackRides | RIFF-like chunks (4 bytes kind, 4 bytes limit, 4 bytes size). Chunk 1 holds sub-chunks; 2 is a 12-byte build stamp text (e.g. `10:12:51Nov 17 1999`); 3 is track ride state; 4 - 9 are visitors in cars and positions. The saves checked only have the stamp |
| FlyingRides | `FLY_`, 4 bytes saved flag; if set 4 bytes table size (400), 100 × 4-byte table, 4 × 4 bytes, 6 × 4 bytes (the last is the slot size, 4652), then a block per non-zero slot after the first |
| RSSE | `RSSE`, 4-byte size (20) and block, 5 × 4 bytes, 4 bytes instance count, 4 bytes instance size (`0xF4`); per instance the record, six blocks (4-byte size and data: code, 2 tables, 3 more), a block of size × 32 bytes, two more blocks, `OBJ ` (stored ` JBO`), 4 bytes count, 4 bytes object size, count × object. See [ride scripts](/formats/rsse/) |
| Camera | 4-byte floats: zoom (110), Y rotation; 4 bytes flags; 3 floats required point of interest; 3 floats saved point of interest; float saved Y rotation |
| Coasters | 4 bytes coaster count, 3 × 4 bytes; per coaster a `0x20`-byte header (4 bytes flags, 2 bytes thing id at +10, 2 bytes piece count at +0x16), 4-byte count and 2-byte list, per piece `0x22` bytes and a 2-byte list (its length at piece byte `0x21`), then per train `0x1B` bytes and per car 11 bytes and two lists of 4-byte values (lengths at car bytes 4 and 5). How many trains and cars comes from the ride's model: **inferred and untested**, no save checked has a coaster |
| Advisor | `ADV_`, 4-byte size and block (360 bytes), 4-byte size and block (the queue) |
| Sound | 4 bytes enabled, 4 bytes flag, 4-byte size and block (1024). If both are set the rest is written by a function not yet decompiled (**inferred**): 3 floats (listener), 4 bytes, 4 bytes object count, 4 bytes, 4 bytes bank count and that many 4-byte values, banks as a 1-byte length and text (e.g. `\data\global\sound\cat_ambient`), 4 bytes, then per object 4 bytes handle, 4 bytes kind, 4 bytes guard `0x12D591`, 36 bytes, guard, 4-byte count and count × 24 bytes, guard, 1 byte, 4 bytes, 4 bytes nested flag, and a nested object (kind first) when set |
| Cheat | 2 × 1 byte |
| AdvisorScoring | 4 bytes |
| UI | 4 bytes window count, count × `0x21C` bytes; ends the data |

The ride system lists the placed objects first (handle 1 or more, kind 815 or 865, the same type ids
as the World objects), then models without a handle (kind 826, outside the park in the saves
checked; meaning not confirmed).
