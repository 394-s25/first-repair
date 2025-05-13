// /src/api/consultationService.js
import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from '../firebase/firebase_ini';

export const addConsultationRequest = async (requestData) => {
  try {
    const docRef = await addDoc(collection(db, "consultationRequests"), {
      ...requestData,
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
    // Query all documents ordered by creation time (newest first)
    const q = query(
      requestsCollection,
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const allRequests = [];
    querySnapshot.forEach((doc) => {
      allRequests.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: allRequests };
  } catch (e) {
    console.error("Error fetching all consultation requests: ", e);
    return { success: false, error: e, data: [] };
  }
};
