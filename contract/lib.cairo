use starknet::ContractAddress;

#[derive(Drop, Copy, Serde, starknet::Store)]
struct Adventure{
    _genesis_timestamp: u64,
    _duration: u64,
    _current_question_id : felt252,
    _current_score : u256,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
struct Question{
    _answer_index : felt252,
}

#[starknet::interface]
trait IGame<TContractState> {
    // ------ Game Actions ------
    fn new_adventure(ref self : TContractState, inviter : ContractAddress, invite_adventure_id : felt252);
    fn answer(ref self : TContractState, answer_index: felt252);
    fn quit(ref self : TContractState);

    // ------ View Functions ------
    fn is_in_game(self : @TContractState) -> bool;
    fn get_current_adventure(self : @TContractState) -> Adventure;
    fn get_adventure(self : @TContractState, adventure_id : felt252 ) -> Adventure;
    fn get_score(self : @TContractState) -> u256;
}

#[starknet::contract]
mod Game{
    use super::ContractAddress;
    use starknet::get_caller_address;
    use super::Adventure;
    use super::Question;
    
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event{
        StartGame: StartGame,
        NextQuestion: NextQuestion,
    }

    #[derive(Drop, starknet::Event)]
    struct StartGame {
        adventure: Adventure,
    }

    #[derive(Drop, starknet::Event)]
    struct NextQuestion {
        question_id: felt252,
    }

    #[storage]
    struct Storage {
        _adventure: LegacyMap::<felt252, Adventure>,
        _question: LegacyMap::<felt252, Question>,
        _game_counter : felt252,
        _owner: LegacyMap::<ContractAddress, felt252>,
        _score: LegacyMap<ContractAddress, u256>,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        let question = Question{
            _answer_index : 1
        };
        self._question.write(1, question);
    }

    #[abi(embed_v0)]
    impl Game of super::IGame<ContractState> {
        fn new_adventure(ref self: ContractState, inviter : ContractAddress,  invite_adventure_id : felt252) {
            assert(_is_in_game(@self), 'Already in game');
            _start_game(ref self);
            _next_question(ref self);
        }

        fn answer(ref self : ContractState, answer_index: felt252){
            let adventure_id = self._owner.read(get_caller_address());
            let mut adventure = self._adventure.read(adventure_id);
            let current_timestamp = starknet::get_block_info().unbox().block_timestamp;
            assert(current_timestamp - adventure._genesis_timestamp < adventure._duration,'Time is over');

            let question = self._question.read(adventure._current_question_id);
            assert(question._answer_index == answer_index, 'Wrong Answer');

            adventure._current_score += 1;
            adventure._duration += 10;
            self._adventure.write(adventure_id, adventure);
            
            _next_question(ref self);
        }

        fn quit(ref self : ContractState){
            let adventure_id = self._owner.read(get_caller_address());
            let mut adventure = self._adventure.read(adventure_id);
            adventure._duration = 0;
            self._adventure.write(adventure_id, adventure);
        }

        fn get_current_adventure(self: @ContractState) -> Adventure {
            let adventure_id = self._owner.read(get_caller_address());
            self._adventure.read(adventure_id)
        }

        fn is_in_game(self: @ContractState) -> bool
        {
            _is_in_game(self)
        }

        fn get_adventure(self: @ContractState, adventure_id : felt252 ) -> Adventure
        {
            self._adventure.read(adventure_id)
        }

        fn get_score(self: @ContractState) -> u256
        {
            self._score.read(get_caller_address())
        }
    }

    fn _is_in_game(self : @ContractState) -> bool
    {
        let adventure_id = self._owner.read(get_caller_address());
        let adventure = self._adventure.read(adventure_id);
        let current_timestamp = starknet::get_block_info().unbox().block_timestamp;
        current_timestamp - adventure._genesis_timestamp < adventure._duration
    }

    fn _start_game(ref self: ContractState)
    {
        let adventure_id = self._game_counter.read() + 1;

        // use current starknet block number and timestamp as entropy sources
        let block_timestamp = starknet::get_block_info().unbox().block_timestamp;

        let mut adventure = Adventure {
            _genesis_timestamp: block_timestamp,
            _duration: 30,
            _current_question_id: 0,
            _current_score: 0,
        };

        self._adventure.write(adventure_id, adventure);

         // increment the adventure id counter
        self._game_counter.write(adventure_id);

        // set caller as owner
        self._owner.write(get_caller_address(), adventure_id);

        self.emit(StartGame{adventure});
    }
    
    fn _next_question(ref self : ContractState)
    {
        // random id
        let question_id = 1;
        self.emit(NextQuestion{question_id});
    }

}