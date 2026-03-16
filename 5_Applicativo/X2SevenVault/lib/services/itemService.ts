import { collection, getDocs, query } from '@react-native-firebase/firestore';
import { db } from '../firestore';

export const getItems = async () => {
    const q = query(collection(db, 'item_management'));

    const querySnapshot = await getDocs(q);

    console.log("Query snapshot: ", querySnapshot);

    querySnapshot.forEach((doc : any) => {
        console.log(doc.id, ' => ', doc.data());
    });

    return querySnapshot;

}

