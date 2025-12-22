#include "../include/mycontract.hpp"

ACTION mycontract::setmsg(name user, string message) {
    require_auth(user);

    messages_table msgs(get_self(), get_self().value);

    auto itr = msgs.find(user.value);
    if (itr == msgs.end()) {
        msgs.emplace(user, [&](auto& row) {
            row.user = user;
            row.message = message;
        });
    } else {
        msgs.modify(itr, user, [&](auto& row) {
            row.message = message;
        });
    }
}

ACTION mycontract::erase(name user) {
    require_auth(user);

    messages_table msgs(get_self(), get_self().value);
    auto itr = msgs.find(user.value);
    check(itr != msgs.end(), "No message found for user");

    msgs.erase(itr);
}

ACTION mycontract::ping(name user) {
    require_auth(get_self());
    print_f("Pong to %\n", user);
}
