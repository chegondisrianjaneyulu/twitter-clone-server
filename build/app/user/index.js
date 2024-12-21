"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mutations_1 = require("./mutations");
const queries_1 = require("./queries");
const reslovers_1 = require("./reslovers");
const types_1 = require("./types");
exports.User = { types: types_1.types, queries: queries_1.queries, reslovers: reslovers_1.reslovers, mutations: mutations_1.mutations };
