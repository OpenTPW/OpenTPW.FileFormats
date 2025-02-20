---
title: Instruction Set
---

## NOP

`NOP` - This performs no operation, essentially wasting 1 cycle.

### Operands

None

## CRIT_LOCK

`CRIT_LOCK` - Locks a ride, preventing visitors from accessing the ride until unlocked.

### Operands

None

## COPY

`COPY <dest> <source>` - Copy a value from one variable to another.

`COPY <dest> <value>` - Set a variable's value.

### Operands

`<dest>` - The destination for the instruction's result.

`<value>` - The value to copy.

`<source>` - The source containing the value to copy.

## SETLV

`SETLV <unknown>` - Unknown

### Operands

Unknown

## SUB

`SUB <value> <value> <dest>` - Subtract one value from another.

`SUB <source> <value> <dest>` - Subtract a value from a variable.

`SUB <value> <source> <dest>` - Subtract variable's value from a value.

`SUB <source> <source> <dest>` - Subtract one variable from another.

Upon performing this calculation, the relevant flags will be set based on the calculation's result.

### Operands

`<dest>` - The destination for the instruction's result.

`<value>` - The value to subtract.

`<source>` - The source containing the value to subtract.

## ENDSLICE

`ENDSLICE` - Unknown

### Operands

Unknown

## GETTIME

`GETTIME <dest>` - Gets the time that the ride has been alive for.

### Operands

`<dest>` - The destination for the instruction's result.

## ADDOBJ

`ADDOBJ <type> <parameter> <id> <slot>` - Add an object of a specific type to the ride.

### Operands

`<type>` - The type of object to add.

`<parameter>` - Unknown

`<id>` - The ID of the object to add.

`<slot>` - The 'slot' within the current ride to add the new ride.

## ADDOBJ_EXT

`ADDOBJ_EXT <unknown1> <unknown2> <unknown3> <unknown4> <unknown5>` - Unknown

### Operands

Unknown

## KILLOBJ

`KILLOBJ <slot>` - Remove an object of a specific slot type.

### Operands

`<slot>` - The slot of the desired object.

## FADEOBJ

`FADEOBJ <slot>` - Fade out an object, and then remove it.

### Operands

`<slot>` - The slot of the desired object.

## SETOBJPARAM

`SETOBJPARAM <slot> <parameter> <value>` - Set a sub-object's parameters.

### Operands

`<slot>` - The slot of the desired object.

`<parameter>` - The parameter to change.

`<value>` - The desired value of the parameter.

## EVENT

`EVENT <type> <unknown> <event>` - Trigger an in-game event.

### Operands

`<type>` - The type of the event.

`<unknown>` - Unknown

`<event>` - The event?

## EVENT_EXT

`EVENT_EXT <unknown1> <unknown2> <unknown3> <unknown4>` - Unknown

### Operands

Unknown

## FLUSHANIM

`FLUSHANIM` - Stop all active animations

### Operands

None

## TRIGANIM

`TRIGANIM <unknown1> <unknown2> <unknown3>` - Unknown

### Operands

Unknown

## WAITANIM

`WAITANIM <type> <unknown>` - Start playing an animation, and wait for it to end before continuing.

### Operands

`<type>` - The type of animation to play

`<unknown>` - Unknown

## LOOPANIM

`LOOPANIM <type> <unknown>` - Start playing an animation on loop

### Operands

`<type>` - The type of animation to play

`<unknown>` - Unknown

## TRIGWAITANIM

`TRIGWAITANIM <unknown1> <unknown2> <unknown3>` - Unknown

### Operands

Unknown

## GETANIM

`GETANIM <unknown>` - Unknown

### Operands

Unknown

## TRIGANIMSPEED

`TRIGANIMSPEED <unknown1> <unknown2> <unknonw3> <unknown4>` - Unknown

### Operands

Unknown

## FLUSHANIM_CH

`FLUSHANIM_CH <unknown>` - Unknown

### Operands

Unknown

## TRIGANIM_CH

`TRIGANIM_CH <unknown1> <unknown2> <unknown3> <unknown4>` - Unknown

### Operands

Unknown

## WAITANIM_CH

`WAITANIM_CH <unknown1> <unknown2> <unknown3>` - Unknown

### Operands

Unknown

## LOOPANIM_CH

`LOOPANIM_CH <unknown1> <unknown2> <unknown3>` - Unknown

### Operands

Unknown

## TRIGWAITANIM_CH

`TRIGWAITANIM_CH <unknown1> <unknown2> <unknown3> <unknown4>` - Unknown

### Operands

Unknown

## GETANIM_CH

`GETANIM_CH <unknown1> <unknown2>` - Unknown

### Operands

Unknown

## RAND

`RAND <dest> <max value>` - Generate a random number.

### Operands

`<dest>` - The destination for the instruction's result.

`<max value>` - The highest value to generate.

## JSR

`JSR <subroutine>` - Jump to a subroutine.

### Operands

`<subroutine>` - The destination subroutine to jump to.

## RETURN

`RETURN` - Return to the previous subroutine (after the last `JSR`).

### Operands

None

## BRANCH

`BRANCH <location>` - Branch to another location.

### Operands

`<location>` - The branch to execute.

## BRANCH_Z

`BRANCH_Z <location>` - Branch to another location if the "zero" flag has been set.

### Operands

`<location>` - The branch to execute.

## BRANCH_NZ

`BRANCH_NZ <location>` - Branch to another location if the "not zero" flag has been set.

### Operands

`<location>` - The branch to execute.

## BRANCH_NV

`BRANCH_NV <location>` - Branch to another location if the "negative value" flag has been set.

### Operands

`<location>` - The branch to execute.

## BRANCH_PV

`BRANCH_PV <location>` - Branch to another location if the "positive value" flag has been set.

### Operands

`<location>` - The branch to execute.

## DBGMSG

`DBGMSG <unknown>` - Unknown

### Operands

Unknown

## NAME

`NAME <value>` - Set the current script's name (likely used for debugging purposes).

### Operands

`<value>` - The new name for the script.

## TEST

`TEST <value>` - Set flags depending on the value given.

This instruction will modify all flags, which can then be used to execute different branches depending on `<value>`.

### Operands

`<value>` - The value to test.

## CMP

`CMP <value / variable> <value / variable>` - Compare two values (using a bitwise AND), and set any flags according to the result.

Upon performing this calculation, the relevant flags will be set based on the calculation's result.

### Operands

`<value / variable>` - A value or variable to compare.

## PUSH

`PUSH <value>` - Push a value to the stack.

### Operands

`<value>` - The value to push onto the stack.

## POP

`POP` - Pop a value from the stack.

### Operands

None

## HUSH

`HUSH <unknown>` - Unknown

### Operands

`<unknown>` - Unknown

## HOP

`HOP <unknown>` - Unknown

### Operands

`<unknown>` - Unknown

## WAIT

`WAIT <time>` - Wait for a specified period of time.

### Operands

`<time>` - The length of time to wait for (cycles / slices / milliseconds?)

## WAITABS

`WAITABS <unknown>` - Unknown

### Operands

Unknown

## WAIT4ANIM

`WAIT4ANIM` - Wait for all of the currently playing animations to finish.

### Operands

None

## ADD

`ADD <source> <value>` - Add a value to the value of a variable.

Upon performing this calculation, the relevant flags will be set based on the calculation's result.

### Operands

`<source>` - The source containing the value to add, and the destination for the result.

`<value>` - The value to add.

## MULT

`MULT <unknown1> <unknown2> <unknown3>` - Multiply values (not used in any existing rides)

Upon performing this calculation, the relevant flags will be set based on the calculation's result.

### Operands

Unknown

## DIV

`DIV <value> <value> <dest>` - Divide one value by another.

`DIV <source> <value> <dest>` - Divide a variable by a value.

`DIV <value> <source> <dest>` - Divide a value by a variable's value.

`DIV <source> <source> <dest>` - Divide one variable by another.

Upon performing this calculation, the relevant flags will be set based on the calculation's result.

### Operands

`<dest>` - The destination for the instruction's result.

`<value>` - The value to divide.

`<source>` - The source containing the value to divide.

## MOD

`MOD <value> <value> <dest>` - Get the remainder of a division of one value from another.

`MOD <source> <value> <dest>` - Get the remainder of a division of a variable by a value.

`MOD <value> <source> <dest>` - Get the remainder of a division of a value by a variable's value.

`MOD <source> <source> <dest>` - Get the remainder of a division of one variable by another.

Upon performing this calculation, the relevant flags will be set based on the calculation's result.

### Operands

`<dest>` - The destination for the instruction's result.

`<value>` - The value to perform modulo on.

`<source>` - The source containing the value to perform modulo on.

## TURBO

`TURBO <value>` - Unknown

### Operands

`<value>` - Unknown [0..1]

## END

`END` - Unknown

### Operands

None

## TOUR

`TOUR <command> <params>` - Call a tour ride command (with parameter if applicable)

### Operands

`<command>` - The command to use

`<params>` - The parameter(s) to give to the command

#### Commands

- `1`: Set style of ride

- `4`: Let off visitor

- `3`: Let on visitor

- `5`: Number of cars

- `6`: Unused ("Unknown tour ride command")

- `7`: Unused ("Unknown tour ride command")

- `8`: Set time to fly for (in milliseconds)

- `9`: Set ride wear status
  
  - `1`: Ok
  
  - `2`: Worn
  
  - `3`: Breaking down
  
  - `4`: Condemned

- `10`: Check if there is a car in the station (sets flags)

- `11`: Activate launch / start flight

- `12`: Set whether ride uses runway type of approach (0/1)

- `14`: Set whether ride is open (0/1)

- `15`: Check if there is a broken car in the station (sets flags)

- `16`: Set whether the ride is running (0/1)

- `17`: Set size of car (1024 == 1)

## BUMP

`BUMP <command> <params>` - Set bumper ride properties, and set flags where appropriate.

### Operands

`<command>` - The ID of the property being set

`<params>` - The value to assign to the property

#### Commands

- `1` (`BUMP_PEEPON`): Add visitor to ride

- `2` (`BUMP_PEEPOFF`): Get visitor from ride

- `3` (`BUMP_STARTRACE`): Start the race

- `4` (`BUMP_LAUNCHCAR`): Launch car

- `5` (`BUMP_ISTRACKVALID`): Get whether the track is valid (sets flags)

- `6` (`BUMP_CLOSERIDE`): Close the ride

- `7` (`BUMP_OPENRIDE`): Open the ride

- `8` (`BUMP_SETBROKEN`): Set whether the ride is broken (0/1)

- `9` (Unnamed?): Set whether the ride is worn or not

- `10` (`BUMP_HALTRIDE`): Eject all visitors from the ride

- `11` (`BUMP_CARSONRIDE`): Get whether there are cars on the ride (0/1)

- `12`: Unknown

- `13`: Unknown

- `14` (`BUMP_SETLAPS`): Set the number of laps

- `15`: Unused ("Unknown bumper ride command")

- `16`: Unknown

- `17` (`BUMP_WATERCLOSED`): Set whether water is flowing (0 - flowing / 1 - not flowing)

## COAST

`COAST <id> <value>` - Set coaster ride properties, and set flags where appropriate.

### Operands

`<id>` - The ID of the property being set

`<value>` - The value to assign to the property

#### IDs

- `COAST_ADDPEEP` - Let on visitor

- `COAST_GETQUEUE` - Gets the number of people in the ride's queue

- `COAST_GETPEEP` - Gets the number of people on the ride

- `COAST_SETBROKE` - Set's the coaster's broken state

- `COAST_SETCLOSED` - Sets the coaster's open/closed state

- `COAST_SETCAPACITY` - Sets the coaster's capacity

- `COAST_SETWORN` - Sets the coaster's wear rating

- `COAST_INITIALISE` - Initialises the coaster

## ADDHEAD

`ADDHEAD <visitor ID>` - Add a visitor (head only) to the ride.

### Operands

`<visitor ID>` - The ID of the visitor to add.

## DELHEAD

`DELHEAD <visitor ID>` - Remove a visitor from the ride.

### Operands

`<visitor ID>` - The ID of the visitor to remove.

## LIMBO

`LIMBO <visitor ID> <unknown>` - Send a visitor into limbo.

### Operands

`<visitor ID>` - The ID of the visitor to send into limbo.

`<unknown>` - Unknown (possibly related to `LIMBOSPACE`, but may also be duration)

## UNLIMBO

`UNLIMBO <visitor ID>` - Remove a visitor from limbo.

### Operands

`<visitor ID>` - The ID of the visitor to remove from limbo.

## FORCEUNLIMBO

`FORCEUNLIMBO <visitor ID>` - Forcefully remove a visitor from limbo.

### Operands

`<visitor ID>` - The ID of the visitor to remove from limbo.

## INLIMBO

`INLIMBO <unknown>` - Unknown

### Operands

`<unknown>` - Unknown.

## LIMBOSPACE

`LIMBOSPACE <unknown>` - Unknown

### Operands

`<unknown>` - Unknown.

## SPAWNCHILD

`SPAWNCHILD <file name>` - Add a child script to the current script (max. 1 child)

### Operands

`<file name>` - The path to the desired script.

## SPAWNSOUND

`SPAWNSOUND <file name>` - Add a child script to the current script (max. 1 child) - likely somewhat different from `SPAWNCHILD`, but unknown.

### Operands

`<file name>` - The path to the desired script.

## REMOVECHILD

`REMOVECHILD` - Remove an existing child script.

### Operands

None

## SETVARINCHILD

`SETVARINCHILD <variable ID> <value>` - Set the value of a variable in the current script's child.

### Operands

`<variable ID>` - The ID of the desired variable.

`<value>` - The desired value to set.

## GETVARINCHILD

`GETVARINCHILD <dest> <variable ID>` - Get the value of a variable in the current script's child.

### Operands

`<variable ID>` - The ID of the desired variable.

`<dest>` - The destination for the value of the desired variable.

## SETVARINPARENT

`SETVARINPARENT <variable ID> <value>` - Set the value of a variable in the current script's parent.

### Operands

`<variable ID>` - The ID of the desired variable.

`<value>` - The desired value to set.

## GETVARINPARENT

`GETVARINPARENT <dest> <variable ID>` - Get the value of a variable in the current script's parent.

### Operands

`<variable ID>` - The ID of the desired variable.

`<dest>` - The destination for the value of the desired variable.

## BOUNCESETNODE

`BOUNCESETNODE <node>` - Unknown

### Operands

Unknown

## BOUNCESETBASE

`BOUNCESETBASE <base>` - Unknown

### Operands

Unknown

## BOUNCE

`BOUNCE <visitor ID> <unknown>` - Unknown

### Operands

Unknown

## UNBOUNCE

`UNBOUNCE <visitor ID>` - Unknown

### Operands

Unknown

## FORCEUNBOUNCE

`FORCEUNBOUNCE <visitor ID>` - Unknown

### Operands

Unknown

## BOUNCING

`BOUNCING <visitor ID>` - Unknown

### Operands

Unknown

## WALKON

`WALKON <visitor ID> <unknown1> <unknown2> <unknown3> <unknown4> <action> <unknown5>` - Unknown

### Operands

Unknown

## WALKOFF

`WALKOFF <visitor ID>` - Unknown

### Operands

Unknown

## WALKGET

`WALKGET <dest>` - Unknown

### Operands

Unknown

## WALKST_FLOAT

`WALKST_FLOAT <unknown1> <unknown2> <unknown3>` - Unknown

### Operands

Unknown

## WALKFLOATSTAT

`WALKFLOATSTAT <unknown>` - Unknown

### Operands

Unknown

## WALKFLOATSTOP

`WALKFLOATSTOP`

### Operands

Unknown

## ENABLELIGHT

`ENABLELIGHT <unknown>`

### Operands

Unknown

## DISABLELIGHT

`DISABLELIGHT <unknown>`

### Operands

Unknown

## SETLIGHT

`SETLIGHT <unknown>`

### Operands

Unknown

## COLOURLIGHT

`COLOURLIGHT <unknown1> <unknown2> <unknown3> <unknown4>`

### Operands

Unknown

## STARTSCREAM

`STARTSCREAM <visitor ID> <unknown>` - Unknown, likely causes a visitor to scream.

### Operands

Unknown

## STOPSCREAM

`STOPSCREAM`

### Operands

None

## SINGLESREAM

`SINGLESCREAM <visitor ID> <unknown>`

### Operands

## SCREAMLEVEL

`SCREAMLEVEL <level>`

### Operands

`<level>` - The desired ride scream level (from 0 to 100).

## FINDSCRIPTRAND

`FINDSCRIPTRAND <ride / object name> <dest>`

### Operands

## GETREMOTEVAR

`GETREMOTEVAR <unknown1> <unknown2> <unknown3>`

### Operands

Unknown

## SETREMOTEVAR

`SETREMOTEVAR <script ID> <variable ID> <value>` - Set the value of another script's variable.

### Operands

`<script ID>` - The ID of the script containing the desired variable.

`<variable ID>` - The ID of the desired variable.

`<value>` - The desired value of the variable.

## REPAIREFFECT

`REPAIREFFECT <value>` - Show or hide repair effect.

### Operands

`<value>` - 0 or 1: 0 for hide, 1 for show.

## GETCUSTPTCLCODE

`GETCUSTPTCLCODE <unknown1> <unknown2>` - Unknown

### Operands

Unknown

## SETTIMER

`SETTIMER <time>` - Unknown

### Operands

Unknown

## GETTIMER

`GETTIMER <unknown>` - Unknown

### Operands

Unknown

## YEAR

`YEAR <dest>` - Get the current in-game year, and put it in the destination variable.

### Operands

`<dest>` - The destination variable for the instruction's result.

## MONTH

`MONTH <dest>` - Get the current in-game month, and put it in the destination variable.

### Operands

`<dest>` - The destination variable for the instruction's result.

## DAY

`DAY <dest>` - Get the current in-game day, and put it in the destination variable.

### Operands

`<dest>` - The destination variable for the instruction's result.

## HOUR

`HOUR <dest>` - Get the current in-game hour, and put it in the destination variable.

### Operands

`<dest>` - The destination variable for the instruction's result.

## MIN

`MIN <dest>` - Get the current in-game minute, and put it in the destination variable.

### Operands

`<dest>` - The destination variable for the instruction's result.

## SEC

`SEC <dest>` - Get the current in-game second, and put it in the destination variable.

### Operands

`<dest>` - The destination variable for the instruction's result.

## SETREVERB

`SETREVERB <level>` - Set the reverb level used for any sounds that output from this ride.

### Operands

`<level>` - The desired reverb level, from 0 (no reverb) to 10 (max reverb).

## DIPMUSIC

`DIPMUSIC <value>` - Mute or unmute music.

### Operands

`<value>` - 0 or 1: 0 for unmute, 1 for mute

## SPARK

`SPARK <unknown1> <unknown2> <unknown3> <unknown4>`

### Operands

Unknown
