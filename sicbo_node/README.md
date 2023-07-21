# Introduction

sicbo game logic，Mainly include, player module, game module, contract module 。

Realize function：

- player module
  - [x] register
  - [x] userInfo
  - [x] sendGameChips

- game module
  - [x] game record
  - [x] player bet
  - [x] player settlement
  - [x] check game status
  - [x] correct game status
- contract module
  - [x] set dice
  - [x] settlement
  - [x] sendChips

## Project begining

exec ./sql/sicbo.sql init mysql

 .env.local rename .env fill in the configuration

```bash
npm i

npm run dev
```
