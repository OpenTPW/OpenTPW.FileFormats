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
