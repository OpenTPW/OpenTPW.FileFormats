---
title: Information
---

Theme Park World uses a stack-based VM in order to give rides and sideshows their functionality. This VM reads from the [RSSE](https://github.com/ThemeParkWorld/OpenTPW/wiki/RSSE-(Ride-&-Sideshow-Script-Engine)) format, and includes over 100 instructions.

## Common Variable Set

The following variables are part of a "common variable set" that must be contained within every ride (these do not apply to features).


| Name             | ID  | Description                                                               |
| ---------------- | --- | ------------------------------------------------------------------------- |
| `VAR_LETMEON`    | 0   | First ID of visitor in ride queue                                         |
| `VAR_LETMEOFF`   | 1   | First ID of visitor wishing to leave                                      |
| `VAR_CAPACITY`   | 2   | How many visitors can use the ride at once                                |
| `VAR_DURATION`   | 3   | The time for the ride to run for                                          |
| `VAR_BREAKSTAT`  | 4   | Whether the ride is broken (1) or not (0)                                 |
| `VAR_ONRIDE`     | 5   | The number of visitors on the ride                                        |
| `VAR_RIDECLOSED` | 6   | Is the ride closed? (0/1)                                                 |
| `VAR_BROKEN`     | 7   | Is the ride broken? (0/1)                                                 |
| `VAR_WORN`       | 8   | How worn is the ride?                                                     |
| `VAR_RUNNING`    | 9   | Is the ride running? (0/1)                                                |
| `VAR_PAD`        | 10  | Unused                                                                    |
| `VAR_PARAM`      | 11  | Sideshows: Determine whether the current visitor will win (1) or lose (0) |

## Flags

**Sign flag**:
- `1` for negative value
- `0` for positive value
  
**Zero flag**:
- `1` for zero
- `0` for not zero

## Execution

These rules were read in Theme Park Inc's engine, which uses the same VM and [script format](/formats/rsse/).
Running every one of Theme Park World's 308 ride scripts for 60 simulated seconds with them, none
stops unexpectedly.

**Scheduling**

- The scheduler visits every script each frame. A script runs when turbo is on, or when
  `((id ^ frame) & 7) == 0`.
- A script runs for at most its time slice of instructions.
- Instructions between `CRIT_LOCK` and `CRIT_UNLOCK` don't count against the slice.
- `ENDSLICE`, `CRIT_UNLOCK` and the waits end the slice.

**The last value register**

- One register holds the last value. `COPY`, `SUB`, `MULT`, `DIV`, `MOD`, `ADD`, `TEST`, `CMP`,
  `RAND`, `GETTIME`, `HUSH` and `HOP` write it.
- `BRANCH_Z`, `BRANCH_NZ`, `BRANCH_NV` and `BRANCH_PV` branch when it is `== 0`, `!= 0`, `< 0` and
  `> 0`.

**Arithmetic**

- `SUB`, `MULT`, `DIV` and `MOD` set `var(a) = val(b) op val(c)`; division by zero gives 0.
- `CMP` sets the register to `var(a) - val(b)`.
- `RAND a, b` sets `var(a) = |rand() >> 1| % (b + 1)`, where `b` is the raw low 16 bits of the
  second operand.

**Stack**

- `JSR` pushes the return address from the top of the stack array.
- `HUSH` and `HOP` push and pop values from the bottom of the same array.
- `RETURN` with an empty stack stops the script.

**Waiting**

- `WAIT n` waits until `now + n / (speed × 0.01 + 0.5)`; the speed is 50 by default.
- `WAITABS` is not scaled.

**Animations**

- `TRIGANIM` and `WAITANIM` use the animation's length minus 300 ms, and at least 300 ms.
- `LOOPANIM` does nothing when the same slot and variant are already looping.
