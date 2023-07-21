# sicbo.aleo

## Program Method

### init

#### Input

- Owner address(address)

#### Output

- Banker's initial chips(chips record)

### send_chips

#### Input

- From chips(chips record)
- Destination address(address)
- Amount(u64)

#### Output

- Change chips(chips record)
- New chips(chips record)

### merge

#### Input

- First chips(chips record)
- Second chips(chips record)

#### Output

- New chips(chips record)

### set_dice

#### Input

- Banker address(address)
- Pips(u8)

#### Output

- Pips(pips record)

### betting

#### Input

- Big or Small, false is small, true is big(bool)
- Bet chips(chips record)
- Bet ammount(u64)
- Banker address(address)
- Player address(address)
  
#### Output

- Player change chips(chips record)
- Bet(bet record)

### settlement

#### Input

- Pips(pips record)
- bet(bet record)
- banker chips(chips record)

#### Output

- Chips earned by player(chips record)
- Banker's change chips(chips record)

## Build Guide

To compile this Aleo program, run:
```bash
leo build
```
