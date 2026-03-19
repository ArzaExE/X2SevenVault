import firestore from '@react-native-firebase/firestore';

export const itemsCollection = firestore().collection('item_management');

export async function getItems() {
  const items = await itemsCollection.get();
  console.log('Items retrieved from Firestore:', items.docs.map(doc => doc.data()));
  return items;
}
