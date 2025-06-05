// /src/api/consultationService.js
import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore"; // Added writeBatch
import { db } from '../firebase/firebase_ini';

export const addConsultationRequest = async (requestData) => {
  try {
    const docRef = await addDoc(collection(db, "consultationRequests"), {
      ...requestData, // requestData.location should now include 'region'
      status: "pending",
      createdAt: serverTimestamp()
    });
    console.log("Consultation request submitted with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Error adding consultation request: ", e);
    return { success: false, error: e };
  }
};

export const getPendingConsultationRequests = async () => {
    try {
      const requestsCollection = collection(db, "consultationRequests");
      // Query for documents where status is 'pending', ordered by creation time
      const q = query(
        requestsCollection,
        where("status", "==", "pending"),
        orderBy("createdAt", "desc") // Show newest pending requests first
      );
  
      const querySnapshot = await getDocs(q);
      const pendingRequests = [];
      querySnapshot.forEach((doc) => {
        pendingRequests.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: pendingRequests };
    } catch (e) {
      console.error("Error fetching pending requests: ", e);
      return { success: false, error: e, data: [] };
    }
};

export const updateConsultationRequestStatus = async (requestId, newStatus) => {
    try {
      const requestDocRef = doc(db, "consultationRequests", requestId);
      await updateDoc(requestDocRef, {
        status: newStatus
      });
      console.log(`Request ${requestId} status updated to ${newStatus}`);
      return { success: true };
    } catch (e) {
      console.error("Error updating request status: ", e);
      return { success: false, error: e };
    }
};

export const getAllConsultationRequests = async () => {
  try {
    const requestsCollection = collection(db, "consultationRequests");
    const q = query(
      requestsCollection,
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const allRequests = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data(); // Get the document data
      allRequests.push({ 
        id: doc.id, 
        ...data, // Spread the original data
        // Convert createdAt to a JavaScript Date object if it exists and has toDate
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
                   ? data.createdAt.toDate() 
                   : null 
      });
    });
    return { success: true, data: allRequests };
  } catch (e) {
    console.error("Error fetching all consultation requests: ", e);
    return { success: false, error: e, data: [] };
  }
};

export const deleteAllConsultationRequests = async () => {
  try {
    const requestsCollectionRef = collection(db, "consultationRequests");
    const q = query(requestsCollectionRef);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No requests to delete.");
      return { success: true, message: "No requests found to delete." };
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((docSnapshot) => {
      batch.delete(doc(db, "consultationRequests", docSnapshot.id));
    });

    await batch.commit();
    console.log("All consultation requests deleted successfully.");
    return { success: true };
  } catch (e) {
    console.error("Error deleting all consultation requests: ", e);
    return { success: false, error: e };
  }
};
