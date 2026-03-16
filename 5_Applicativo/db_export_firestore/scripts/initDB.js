const admin = require("firebase-admin");
const serviceAccount = require("./x2sevenvault-db-firebase-adminsdk-fbsvc-2bc6b4f96f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─────────────────────────────────────────────
// GENERATE IDs
// ─────────────────────────────────────────────
const genId = () => db.collection("_").doc().id;

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const warehouses = [
  {
    warehouse_id: "WH_A",
    name: "Warehouse A",
    description: "Main workshop storage",
    is_active: true,
    aisles: [
      {
        aisle_id: "A1",
        name: "Aisle A1",
        description: "Electronics and accessories area",
        is_active: true,
        shelves: [
          {
            shelf_id: "A1_S1",
            name: "Shelf A1-1",
            description: "Top level",
            is_active: true,
          },
          {
            shelf_id: "A1_S2",
            name: "Shelf A1-2",
            description: "Middle level",
            is_active: true,
          },
        ],
      },
      {
        aisle_id: "A2",
        name: "Aisle A2",
        description: "Safety equipment area",
        is_active: true,
        shelves: [
          {
            shelf_id: "A2_S1",
            name: "Shelf A2-1",
            description: "Bottom level",
            is_active: true,
          },
        ],
      },
      {
        aisle_id: "A3",
        name: "Aisle A3",
        description: "General supplies area",
        is_active: true,
        shelves: [
          {
            shelf_id: "A3_S1",
            name: "Shelf A3-1",
            description: "Middle level",
            is_active: true,
          },
        ],
      },
    ],
  },
];

const items = [
  {
    item_id: genId(),
    name: "Apple AirPods Pro 2nd Gen",
    description: "Wireless in-ear headphones with active noise cancellation and spatial audio support",
    ai_class_id: genId(),
    quantity: 12,
    physical_properties: {
      weight: { unit: "g", value: 50.8 },
      width:  { unit: "mm", value: 46.4 },
      height: { unit: "mm", value: 30.9 },
    },
    is_active: true,
    reference_photo: "gs://items/airpods.jpg",
    warehouse_id: "WH_A",
    aisle_id: "A1",
    shelf_id: "A1_S1",
  },
  {
    item_id: genId(),
    name: "Stainless Steel Water Bottle 750ml",
    description: "Double-wall insulated stainless steel bottle, keeps beverages cold 24h or hot 12h",
    ai_class_id: genId(),
    quantity: 35,
    physical_properties: {
      weight: { unit: "g", value: 320 },
      width:  { unit: "mm", value: 75 },
      height: { unit: "mm", value: 270 },
    },
    is_active: true,
    reference_photo: "gs://items/bottle.jpg",
    warehouse_id: "WH_A",
    aisle_id: "A3",
    shelf_id: "A3_S1",
  },
  {
    item_id: genId(),
    name: "Schuko Electric Socket Outlet",
    description: "Standard European 230V 16A flush-mounted electric socket with child protection",
    ai_class_id: genId(),
    quantity: 80,
    physical_properties: {
      weight: { unit: "g", value: 95 },
      width:  { unit: "mm", value: 68 },
      height: { unit: "mm", value: 42 },
    },
    is_active: true,
    reference_photo: "gs://items/electric_socket.jpg",
    warehouse_id: "WH_A",
    aisle_id: "A1",
    shelf_id: "A1_S2",
  },
  {
    item_id: genId(),
    name: "Industrial Safety Helmet EN397",
    description: "Hard hat compliant with EN397 standard, ABS shell with adjustable suspension system",
    ai_class_id: genId(),
    quantity: 20,
    physical_properties: {
      weight: { unit: "g", value: 385 },
      width:  { unit: "mm", value: 230 },
      height: { unit: "mm", value: 175 },
    },
    is_active: true,
    reference_photo: "gs://items/helmet.jpg",
    warehouse_id: "WH_A",
    aisle_id: "A2",
    shelf_id: "A2_S1",
  },
  {
    item_id: genId(),
    name: "Arduino Uno R4 WiFi",
    description: "Microcontroller board based on Renesas RA4M1, built-in WiFi and LED matrix",
    ai_class_id: genId(),
    quantity: 25,
    physical_properties: {
      weight: { unit: "g", value: 37 },
      width:  { unit: "mm", value: 68.6 },
      height: { unit: "mm", value: 53.4 },
    },
    is_active: true,
    reference_photo: "gs://items/microcontroller.jpg",
    warehouse_id: "WH_A",
    aisle_id: "A1",
    shelf_id: "A1_S2",
  },
];

const users = [
  {
    user_id: "admin_001",
    email: "admin@samt.ch",
    // ⚠️ Use Firebase Authentication in production.
    // Never store real passwords in Firestore.
    password_hash: "$2b$10$...",
    role: {
      role_id: 1,
      role_name: "admin",
      description: "Full system access",
    },
    full_name: "Mario Rossi",
    is_active: true,
  },
];

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────

async function initDB() {
  console.log("\n🚀 Initializing Firestore database...\n");

  // ── WAREHOUSE_MANAGEMENT ──────────────────
  for (const warehouse of warehouses) {
    const { aisles, ...warehouseData } = warehouse;

    await db
      .collection("warehouse_management")
      .doc(warehouse.warehouse_id)
      .set(warehouseData);
    console.log(`✅ warehouse: ${warehouse.warehouse_id}`);

    for (const aisle of aisles) {
      const { shelves, ...aisleData } = aisle;

      await db
        .collection("warehouse_management")
        .doc(warehouse.warehouse_id)
        .collection("aisles")
        .doc(aisle.aisle_id)
        .set(aisleData);
      console.log(`  ✅ aisle: ${aisle.aisle_id}`);

      for (const shelf of shelves) {
        await db
          .collection("warehouse_management")
          .doc(warehouse.warehouse_id)
          .collection("aisles")
          .doc(aisle.aisle_id)
          .collection("shelves")
          .doc(shelf.shelf_id)
          .set(shelf);
        console.log(`    ✅ shelf: ${shelf.shelf_id}`);
      }
    }
  }

  // ── ITEM_MANAGEMENT ───────────────────────
  for (const item of items) {
    await db
      .collection("item_management")
      .doc(item.item_id)
      .set(item);
    console.log(`✅ item: ${item.item_id} — ${item.name} (ai_class_id: ${item.ai_class_id})`);
  }

  // ── USER_MANAGEMENT ───────────────────────
  for (const user of users) {
    await db
      .collection("user_management")
      .doc(user.user_id)
      .set(user);
    console.log(`✅ user: ${user.user_id}`);
  }

  console.log("\n🎉 Database initialized successfully!\n");
}

initDB().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});