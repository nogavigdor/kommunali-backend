"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
var mongoose_1 = require("mongoose");
// Define the Product schema directly within the Store schema
var ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: false },
    status: {
        type: String,
        enum: ['available', 'reserved', 'sold', 'hidden'],
        default: 'available',
    },
    requestQueue: [{ user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now } }],
    //reservedFor: { type: mongoose.Schema.Types.ObjectId, default: null },
    //reservedExpiration: { type: Date, default: null },
    soldTo: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
}, { timestamps: true, _id: true });
// Define the Store schema
var StoreSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerFirebaseId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    address: {
        street: { type: String, required: true },
        houseNumber: { type: String, required: true },
        apartment: { type: String },
        postalCode: { type: String, required: true },
        city: { type: String, required: true },
    },
    products: { type: [ProductSchema], default: [] },
}, { timestamps: true });
// Create a 2dsphere index for geospatial queries
StoreSchema.index({ location: '2dsphere' });
// Export the Store model
exports.Store = mongoose_1.default.model('Store', StoreSchema);
