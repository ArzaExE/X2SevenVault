const admin = require("firebase-admin");
const fs = require("fs");

admin.initializeApp({
    credential: admin.credential.cert("../firebase-credentials.json"),
});

const db = admin.firestore();

// 🔁 funzione ricorsiva
async function exportDocument(docRef) {
    const docSnap = await docRef.get();
    const data = docSnap.data() || {};

    // 🔍 prendi tutte le subcollection
    const subcollections = await docRef.listCollections();

    for (const sub of subcollections) {
        const subSnapshot = await sub.get();
        data[sub.id] = [];

        for (const subDoc of subSnapshot.docs) {
            const subData = await exportDocument(subDoc.ref);
            data[sub.id].push({
                id: subDoc.id,
                ...subData,
            });
        }
    }

    return data;
}

// 📦 export collection completa
async function exportCollection(name) {
    const snapshot = await db.collection(name).get();
    const result = [];

    for (const doc of snapshot.docs) {
        const data = await exportDocument(doc.ref);
        result.push({
            id: doc.id,
            ...data,
        });
    }

    fs.writeFileSync(`${name}.json`, JSON.stringify(result, null, 2));
}

// 🚀 run
(async () => {
    await exportCollection("warehouse_management");
})();
