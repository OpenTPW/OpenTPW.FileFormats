---
title: Lobby scripts (*.txt)
---

The lobby - the island-selection screen the game opens on - is configured by plain-text files in
`lobby.wad`. There is one for the lobby itself and one per park:

| File | Describes |
| --- | --- |
| `lobby.txt` | The camera, the globe, and where each island sits |
| `jungle.txt` | Lost Kingdom |
| `fantasy.txt` | Wonder Land |
| `hallow.txt` | Halloween World |
| `space.txt` | Space Zone |

They are short. `hallow.txt` in full:

```
ISLAND(2,"data\lobby\terrain","hal_isle","hal_gate","Halloween",180.0,38.0)
FLYINGMESH("data\lobby\terrain","bat",50,200.0,100.0,200.0,2.5)
LIGHTNING(63)
RAINY(1)
SKYCOLOUR(4,44,12)
```

## The vocabulary is closed

The parser (`FUN_005e3210`) splits the file on newlines and `strncmp`s each line against a table
of twelve keywords, which sit contiguously in the executable at `0x00774ce0`:

```
ISLANDCAMERAPOSITION(   GLOBERADIUSIN(   GLOBERADIUSOUT(   VERTICALOFFSET(
SPINRADIUS(   SPINSPEED(   ISLANDFOV(   SKYCOLOUR(   RAINY(   LIGHTNING(
FLYINGMESH(   ISLAND(
```

That table is the entire vocabulary - there is nothing else a lobby script can say. Anything else
the lobby does is a model animation or is hard-coded. Worth stating outright, because the shipped
scripts use only seven of the twelve and it is otherwise tempting to assume the missing effects
are configured somewhere else.

Note that the keywords are matched **including** the opening bracket. `ISLAND` alone would also
match `ISLANDFOV` and `ISLANDCAMERAPOSITION`.

Having found a keyword the parser scans forward to `(` and then reads field by field, stopping
each field at `,`, `"` or `)` as appropriate. Quoted fields are paths and names; everything else
is a number.

## Per-park directives

### `ISLAND(index, dir, isle, gate, name, heading, cameraHeight)`

The park itself. `index` is its place in the lobby's running order, `isle` and `gate` are `.md2`
names under `dir`, `heading` is where the island sits around the lobby globe in degrees, and
`cameraHeight` is how far above the island the camera looks (12.5 for the jungle against 38 for
hallow).

`name` is the park name, but only the jungle's is what the player is shown - the other three are
`"Fantasy"`, `"Halloween"` and `"Space"` where the game displays Wonder Land, Halloween World and
Space Zone. The displayed names are not in the shipped data at all.

### `FLYINGMESH(dir, model, count, x, y, z, speed)`

A swarm of animated models flying around the island. Only two parks use it:

| Park | Flyers |
| --- | --- |
| jungle | 10 `bfly_PINK` and 10 `bfly_YELL`, speed 1.5 |
| hallow | 50 `bat`, speed 2.5 |

**The last float is speed, not scale**, which is the obvious reading and the wrong one. It is
stored at `+0x28` on each flyer, and the per-flyer update multiplies it into the step:

```c
position += direction * flyer[0x28] * delta
```

Nothing in `FLYINGMESH` scales the model. Flying meshes are drawn at the size they were authored.

The speed is in the same per-tick units as `SPINSPEED` and the camera lag - the delta the game
multiplies by is counted in ticks of 25fps rather than in seconds - so 1.5 is 37.5 units a second
and 2.5 is 62.5.

**The three volume floats are the box's full size, not its half-extents.** Every random point the
original picks is

```c
coord = centre + extent * (random01 - 0.5)
```

from the constants `1/2^30` at `0x00702adc` and `0.5` at `0x00702ae0`. The centre is the island's
own position, unshifted (the offset constant at `0x00702d40` is zero). They are `200.0, 100.0,
200.0` in every use - 200 wide, 100 tall, 200 deep in the original's Y-up axes - so there is no
per-park variation.

The count is scaled by a detail percentage and clamped, so there is always at least one flyer and
never more than the script asked for. At full detail it is the script's number.

#### Flight

The swarm's tick builds flyers up over several frames rather than all at once: it makes one, then
keeps going with a seven-in-eight chance, so fifty bats take about six frames.

Each flyer's update (`FUN_005d9b50`) is the whole behaviour:

```c
wanted    = normalise( target - position )
direction = normalise( direction + (wanted - direction) * delta * 0.1 )
position += direction * speed * delta

if ( distanceSquared( position, target ) < 500 )
    target = randomPointInBox()
```

So: pick a random point in the box, lag toward it (never turning sharply), and on arrival - within
about 22 units, from the hard-coded `500.0` compared squared - pick another. There is no wander,
no boundary avoidance and no flocking. The box is respected because every destination is inside
it, not because anything pushes back at the edges.

Orientation is built with the flight direction as forward and a sideways axis of
`normalise(dz, 0, -dx)` - note the zero in the up slot, at `0x00702a38` - so a flyer pitches with
its climb and dive but never banks into a turn.

### `SKYCOLOUR(r, g, b)`

Three 0-255 components, stored as 16.16 fixed point. All four parks set one: jungle
`243,203,191`, fantasy `5,170,255`, hallow `4,44,12`, space `125,8,8`.

**It does not paint the sky.** The lobby's sky is a textured one, loaded once and never
swapped: `FUN_005d8b50` hands the hard-coded path `Data\Levels\fantasy` to the sky loader, so
every island in the lobby sits under Wonder Land's sky - `sky\sky_cyl.tga` for the dome and
`sky\sky.tga` for the cloud layers over it. Both are blue.

What `SKYCOLOUR` reaches is that sky's **vertex colours** - and only some of them.

The sky is drawn as a horizon band plus up to four cloud layers on a 16x16 grid above it. The
grid's vertex colours come from a 256-entry ramp, one copy per layer, at `skyObject + 0xf60`,
`+0x1360`, `+0x1760` and `+0x1b60` - normally a 16x16 downsample of `sky\sky_rgb.tga` built by
`FUN_00585ce0`, a gradient from pale cyan to deep blue. Each lobby frame `FUN_005d96c0` floods
**the first copy only** with a single colour, and that colour is `SKYCOLOUR`.

So it reaches exactly one of the four cloud layers. The other three keep the gradient, and the
horizon band is drawn at plain white with no ramp at all - which is why the horizon stays blue
whatever a park asks for.

### The sky's geometry

Everything below is read out of `FUN_00584ef0` (the sky object's init), `FUN_00585720` (which
builds the mesh) and `FUN_005863c0` (the draw).

| | Value | Where from |
| --- | --- | --- |
| Cloud grid | 16x16 vertices over 2400 units | `+0x21e0`/`+0x21e4` = `0x960` |
| Grid centre | `(0, 180, 0)` in the lobby, height 300 elsewhere | `FUN_00585690( 0, 180, 0 )` |
| Droop | height is `centre - 0.2 * radius` | `0x00701f54` |
| Band radius | 0.6 of the grid's half width, so 720 | `0x00701f58` |
| Band rings | radii 1, 0.98, 0.96, 0.84 of that | `0x00701f64`.. |
| Band height | +/- 36, meeting the dome exactly at its radius | derived |
| Band columns | 9 per half turn, texture wrapping once per half | draw loop |

`sky_cyl.tga` is the same gradient stacked twice vertically, which is why each half of the band
gets one copy of it. The lobby picks a different V band from a park - a whole copy, with the top
row repeated at the bottom, mirroring the gradient below the horizon.

The four cloud layers share the grid and differ only in these:

| Layer | Tiling | Scroll U | Scroll V | Opacity |
| --- | --- | --- | --- | --- |
| 0 | 7pi/112 | 0.0008 | 0.00009 | 0xCF |
| 1 | 6pi/112 | 0.0013 | 0.00006 | 0x97 |
| 2 | 5pi/112 | 0.0018 | 0.00003 | 0x5F |
| 3 | 4pi/112 | 0.0023 | 0 | 0x27 |

Scroll is per tick at 25fps. `sky.tga` is flat white with its clouds entirely in the alpha
channel, so what a layer paints is its ramp colour and the texture only says where.

Finally, `DAT_008bcbc8 & 0x2000000` - set by the lobby's island view and by nothing else - draws
every cloud layer a second time at `(-x, -y, -height)`. The dome on its own is a disc that stops
where it would fall below the horizon band; its reflection is a bowl rising to meet that edge,
and the two close the sky into a lens with the camera inside.

It is also conditional. The flood only uses `SKYCOLOUR` when both

- `SKYQUALITY > 1` - the number of cloud layers, from the detail preset. `low.sam` sets 1,
  `med.sam` 2, `high.sam` 4. **On Low detail the tint is never applied.**
- the hardware rendering path is active (`DAT_0078d8d8 == 1`, set by `FUN_0044de20`).

Otherwise the ramp is flooded with the current fog colour instead, which the lobby sets to a
fixed `0xFF44DDFF` - light blue.

#### The red channel is bugged

The flood eases the colour rather than snapping to it, one sixteenth of the remaining distance
per frame, from separate "current" fields at `+0x44/+0x48/+0x4c`. Red is read from the wrong
slot:

```
5d96e1: mov edx,[ecx+0x50]   ; the red target - only ever compared, never used
...
5d96fc: mov edx,[ecx+0x58]   ; the blue target
5d9702: mov eax,edx
5d9704: sub eax,esi          ; esi is the *current red*
5d9706: sar eax,0x4
5d9709: add eax,esi
5d970b: mov [ecx+0x44],eax   ; stored back as red
```

So red converges on the blue the script asked for, and no park gets the colour it wrote:

| Park | Asked for | Actually gets |
| --- | --- | --- |
| jungle | 243, 203, 191 | 191, 203, 191 |
| fantasy | 5, 170, 255 | 255, 170, 255 |
| hallow | 4, 44, 12 | 12, 44, 12 |
| space | 125, 8, 8 | 8, 8, 8 |

Multiplied onto a blue sky, jungle's near-neutral grey and fantasy's magenta both leave it
looking blue; hallow and space take it to nearly black.

The bug has a second effect. The ease only runs while current and target differ, and the
comparison tests red against `+0x50` while the ease drives it toward `+0x58` - so for any park
whose red and blue differ, which is all four, the two never agree and the ease restarts every
frame forever. The "converged" branch, which would fall back to the fog colour, is unreachable.

### `RAINY(n)`

A rain level. Only hallow sets it, to 1.

### `LIGHTNING(n)`

**A probability mask, not a count or a period.** Each frame the lobby tick draws a random number
and strikes when

```c
(n & random) == 1
```

A strike therefore needs bit 0 of `n` set and every other bit of the masked value clear, so the
chance per frame is `1 / 2^(bits set in n)` - and **never**, if `n` is even. Only hallow sets it,
to 63, which is six bits: one frame in sixty-four, or about one strike every two and a half
seconds at the 25fps the rest of the game's data assumes.

The bolt runs from ground level to 500 units up. Its base lands within fifty units of the island
(`random01 * 100 - 50`, from `0x00702c94`) and its top leans by up to ten more
(`random01 * 20 - 10`, from `0x00702c8c`). A strike also raises a flag the renderer flashes on,
and plays a thunder sound.

## Lobby-wide directives

These appear only in `lobby.txt`:

| Directive | Shipped value | Meaning |
| --- | --- | --- |
| `ISLANDCAMERAPOSITION(i, x, y)` | ten entries | Where island `i` sits. Only the first four are used. |
| `SPINRADIUS(n)` | 70 | The camera's distance from the island it is orbiting |
| `SPINSPEED(n)` | 0.02 | Orbit speed, per frame |
| `VERTICALOFFSET(n)` | 20 | How far above the island the camera orbits |
| `GLOBERADIUSOUT(n)` | 475 | Camera distance from the globe, zoomed out |
| `GLOBERADIUSIN(n)` | 200 | Camera distance from the globe, zoomed in |
| `ISLANDFOV(n)` | 100 | Field of view. Not degrees - see below. |

Selecting a park in the original spins the globe until that island's `ISLAND()` heading faces the
camera, then pulls in from `GLOBERADIUSOUT` to `GLOBERADIUSIN`.

## How the weather is scoped

Rain, lightning and sky colour are **not** properties of a place. The lobby tick works out which
island is nearest the camera and then, every frame, copies that island's `SKYCOLOUR` into the
lobby camera's target colour, its `RAINY` value into a single global rain level, and rolls its
`LIGHTNING` mask. There is one sky, one rain system and one bolt for the whole lobby; selecting a
park is what changes them.

Fog is separate and is not driven by any of this. `FUN_005d8b50` sets the lobby's fog colour to a
constant `0xFF44DDFF` with a near of 50 and a far of 300, and the island view then turns fog
**off** outright (`FUN_005d9690`, clearing bit `0x2000`). Only the globe views run with it on.

## Open questions

- `ISLANDFOV(100)` is not a vertical field of view in degrees - read that way the islands become
  specks in a bowed horizon. It means something else, or reaches the projection another way.
- `SPINSPEED(0.02)` read as radians per frame is half a radian a second at 25fps, which is much
  brisker than the lobby appears to turn.
- Whether the flying-mesh `500.0` and the lightning bolt's 500-unit height being the same number
  is meaningful or a coincidence.
- What `DAT_0078d8d8` is set from. It gates the sky tint on the hardware path, but the value
  itself is written through a pointer rather than by name, so which option writes it is unproven.
