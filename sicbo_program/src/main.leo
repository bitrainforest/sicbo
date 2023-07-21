// The 'sicbo' program.
program sicbo.aleo {

    mapping is_init: u8 => bool;
    mapping is_set_dice: u8 => bool;

    record chips {
        owner: address,
        gates: u64,
    }

    record pips {
        owner: address,
        gates: u8,
    }

    record bet {
        // banker address
        owner: address,
        gates: u64,
        // false small, true big
        big_or_small: bool,
        player: address,
    }

    transition init(
         owner_addr: address
    ) -> chips {
        let init_chips: chips = chips {
            owner: owner_addr,
            gates: 10000000u64
        };

        return init_chips then finalize();
    }

    finalize init() {
        let is_init_value: bool = Mapping::get_or_use(is_init, 0u8, false);
        assert_eq(is_init_value, false);

        Mapping::set(is_init, 0u8, true);
        Mapping::set(is_set_dice, 0u8, false);
    }

    transition send_chips(
        chips_record: chips,
        to: address,
        value: u64
    ) -> (chips, chips) {
        assert(chips_record.gates >= value);
        let remain: u64 = chips_record.gates - value;

        let new_from_chips: chips = chips {
            owner: chips_record.owner,
            gates: remain
        };

        let new_chips: chips = chips {
            owner: to,
            gates: value
        };

        return (new_from_chips, new_chips);
    }

    transition merge(
        chips1: chips,
        chips2: chips
    ) -> chips {
        assert_eq(chips1.owner, chips2.owner);

        let new_chips: chips = chips {
            owner: chips1.owner,
            gates: chips1.gates + chips2.gates
        };

        return new_chips;
    }

    transition set_dice(
        banker_address: address,
        pips_value: u8,
    ) -> pips {
        let pips_record: pips = pips {
            owner: banker_address,
            gates: pips_value,
        };

        return pips_record then finalize();
    }

    finalize set_dice() {
        let is_set_dice_value: bool = Mapping::get(is_set_dice, 0u8);
        assert_eq(is_set_dice_value, false);
        Mapping::set(is_set_dice, 0u8, true);
    }

    transition betting(
        // false small, true big
        big_or_small: bool,
        chips_value: chips,
        bet_value: u64,
        banker_address: address,
        player_address: address
    ) -> (chips, bet) {
        assert(chips_value.gates >= bet_value);
        let remain: u64 = chips_value.gates - bet_value;

        let new_chips: chips = chips {
            owner: chips_value.owner,
            gates: remain
        };

        let bet_record: bet = bet {
           owner: banker_address,
           gates: bet_value,
           big_or_small: big_or_small,
           player: player_address,
        };

        return (new_chips, bet_record);
    }

    transition settlement(
        pips_record: pips,
        bet_record: bet,
        banker_chips: chips
    ) -> (chips, chips) {
        let big_or_small: bool = pips_record.gates % 16u8 + 3u8 >= 11u8;

        let player_chips_value: u64 = 0u64;
        let banker_chips_value: u64 = banker_chips.gates;

        if big_or_small == bet_record.big_or_small {
            assert(banker_chips_value >= bet_record.gates);

            player_chips_value = bet_record.gates * 2u64;
            banker_chips_value -= bet_record.gates;
        } else {
            banker_chips_value += bet_record.gates;
        }

        let new_player_chips: chips = chips {
            owner: bet_record.player,
            gates: player_chips_value
        };

        let new_banker_chips: chips = chips {
            owner: banker_chips.owner,
            gates: banker_chips_value
        };

        return (new_player_chips, new_banker_chips) then finalize();
    }

    finalize settlement() {
        Mapping::set(is_set_dice, 0u8, false);
    }
}
