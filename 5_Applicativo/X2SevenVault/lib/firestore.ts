import firestore from '@react-native-firebase/firestore';

export const itemsCollection = firestore().collection('item_management');
export const warehousesCollection = firestore().collection('warehouse_management');

export async function getItemByAI(itemAiId: string) {
  const snapshot = await itemsCollection
    .where('ai_class_id', '==', itemAiId)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return doc.data();
}


export async function getWarehouseById(warehouseId: string) {
  const doc = await warehousesCollection.doc(warehouseId).get();
  
  if (!doc.exists) return null;
  
  return doc.data();
}

export async function getCompleteData(itemAiId: string) {
  const item = await getItemByAI(itemAiId);
  const warehouse = await getWarehouseById(item?.warehouse_id);
  return { item, warehouse };
}
