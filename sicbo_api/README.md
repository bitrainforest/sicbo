# sicbo_api

sicbo_api is a service for providing HTTP call to sicbo program

## Usage

```shell
Usage: sicbo_contract_api [OPTIONS] --private-key <PRIVATE_KEY> --program-name <PROGRAM_NAME>

Options:
      --bind <BIND>                  [default: 0.0.0.0:40000]
      --private-key <PRIVATE_KEY>
      --program-name <PROGRAM_NAME>
  -h, --help                         Print help
  -V, --version                      Print version
```

### API

#### POST sendchips

- Request Body:
  
    ["banker chips(plaintext)", "player address", "amount"]

- Response Body:

    ["banker change chips(ciphertext)", "player chips(ciphertext)"]

#### POST setdice

- Request Body:
  
    ["banker address", "pips"]
  
- Response Body:
  
    ["pips record(ciphertext)"]

#### POST settlement

- Request Body:

    ["pips record(plaintext)", "bet(plaintext)", "banker chips(plaintext)"]
  
- Response Body:

    ["player earn chips(ciphertext)", "banker change chips(ciphertext)"]

#### POST decrypt

- Request Body:

    "record(ciphertext)"
  
- Response Body:

    "record(plaintext)"

## Build

```shell
cargo build --release
```
