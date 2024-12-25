"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var Store_1 = require("../src/models/Store");
var typesense_1 = require("typesense");
var dotenv = require("dotenv");
dotenv.config({ path: '../.env' });
var TYPESENSE_NODES = [
    {
        host: process.env.TYPESENSE_HOST || 'localhost',
        port: 443,
        protocol: 'https',
    },
];
var TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || '';
var TYPESENSE_COLLECTION_NAME = process.env.TYPESENSE_COLLECTION_NAME || 'dev_kommunali_products';
var typesenseClient = new typesense_1.default.Client({
    nodes: TYPESENSE_NODES,
    apiKey: TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 2,
});
var typesenseSchema = {
    name: TYPESENSE_COLLECTION_NAME,
    fields: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'price', type: 'float' },
        { name: 'imageUrl', type: 'string' },
        { name: 'status', type: 'string', facet: true },
        { name: 'createdAt', type: 'int64' },
        { name: 'updatedAt', type: 'int64' },
        { name: 'storeId', type: 'string', facet: true },
        { name: 'id', type: 'string' },
    ],
    default_sorting_field: 'createdAt',
};
function populateTypesense() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1, stores, products, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, 10, 11]);
                    return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGO_URI || '')];
                case 1:
                    _a.sent();
                    console.log('MongoDB connected successfully');
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, typesenseClient.collections(TYPESENSE_COLLECTION_NAME).delete()];
                case 3:
                    _a.sent();
                    console.log("Deleted existing collection: ".concat(TYPESENSE_COLLECTION_NAME));
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.log('Collection does not exist or could not be deleted:', err_1.message);
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, typesenseClient.collections().create(typesenseSchema)];
                case 6:
                    _a.sent();
                    console.log("Created collection: ".concat(TYPESENSE_COLLECTION_NAME));
                    return [4 /*yield*/, Store_1.Store.find().exec()];
                case 7:
                    stores = _a.sent();
                    products = stores.flatMap(function (store) {
                        return store.products.map(function (product) {
                            var productWithDates = product;
                            return {
                                name: productWithDates.name,
                                description: productWithDates.description,
                                price: productWithDates.price,
                                imageUrl: productWithDates.imageUrl,
                                status: productWithDates.status,
                                createdAt: Math.floor(new Date(productWithDates.createdAt).getTime() / 1000),
                                updatedAt: Math.floor(new Date(productWithDates.updatedAt).getTime() / 1000),
                                storeId: store._id.toString(),
                                id: productWithDates._id ? productWithDates._id.toString() : '',
                            };
                        });
                    });
                    console.log("Importing ".concat(products.length, " products into Typesense..."));
                    return [4 /*yield*/, typesenseClient.collections(TYPESENSE_COLLECTION_NAME).documents().import(products, { action: 'upsert' })];
                case 8:
                    response = _a.sent();
                    console.log('Import response:', response);
                    return [3 /*break*/, 11];
                case 9:
                    error_1 = _a.sent();
                    console.error('Error populating Typesense:', error_1);
                    return [3 /*break*/, 11];
                case 10:
                    mongoose_1.default.connection.close();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
populateTypesense();
