#pragma once
#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/singleton.hpp>

using namespace eosio;
using std::string;

CONTRACT mycontract : public contract {
public:
    using contract::contract;

    // ACTION: store a message
    ACTION setmsg(name user, string message);

    // ACTION: erase a user's message
    ACTION erase(name user);

    // TABLE: stores messages
    TABLE message_row {
        name    user;
        string  message;

        uint64_t primary_key() const { return user.value; }
    };

    typedef multi_index<"messages"_n, message_row> messages_table;

    // INLINE ACTION example
    ACTION ping(name user);
};
