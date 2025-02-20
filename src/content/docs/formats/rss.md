---
title: Ride Script Source (*.rss)
---

## RSS

RSS is a source file that is used in order to define a ride's behaviour before it is compiled into an RSE file.  These files use assembly-styled syntax; for example:

```assembly
; *** Gate Closes ***
.closed     TEST        VAR_STATUS
            BRANCH_Z    loop
            TRIGANIM    ANIM_Main         0           0
            WAIT        500
            EVENT       OBJ_SOUND_LOC_AMB 1           EVT_UI_GATECLOSENORMAL
            WAIT4ANIM
            COPY        VAR_STATUS        0
            BRANCH      loop
```

### Preprocessor Directives

| Name         | Description                                                       |
| ------------ | ----------------------------------------------------------------- |
| `#setstack`  | The ride's stack size                                             |
| `#setlimbo`  | The ride's limbo size                                             |
| `#setbounce` | The ride's bounce size                                            |
| `#setwalk`   | The number of people that can walk around at any given time       |
| `#include`   | Includes macros / definitions from external C / C++ header files. |
