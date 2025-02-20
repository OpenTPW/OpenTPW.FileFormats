---
title: Settings and Modifiers (*.sam)
---

SAM (**S**ettings **a**nd **M**odifiers) is a plain-text format that specifies various options for within the game. These files can be found both within archives and within the base directories for Theme Park World.  

A typical SAM file may look like this:

```text
# Sell 30 Drinks in 60 days
Challenges[1].Type                  3
Challenges[1].FollowupType          0
Challenges[1].TargetTime            60
Challenges[1].TargetVal             30
Challenges[1].TargetObj             0
Challenges[1].TargetObj2            0
Challenges[1].TargetStaffType       0
Challenges[1].Prize                 5000
Challenges[1].CheckAtEndOnly        0
Challenges[1].Independent           1
```

They are often well-commented, meaning that the purpose of the file & its contents can easily be discerned without needing access to any of the source code for the game.

## Format

SAM files often follow the format of `key <whitespace> value`, making the format incredibly easy to read, understand, and modify.
Comments are preceded with a pound symbol (`#`) and continue until the end of the line.
Strings are surrounded with double quotes (`"`) and are used for various properties, i.e. the ride's name.
