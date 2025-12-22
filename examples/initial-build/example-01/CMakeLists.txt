cmake_minimum_required(VERSION 3.5)
project(mycontract)

set(CMAKE_CXX_STANDARD 17)

find_package(eosio.cdt)

add_contract(mycontract mycontract
    contract/src/mycontract.cpp
    contract/include/mycontract.hpp
)

target_include_directories(mycontract PUBLIC contract/include)
