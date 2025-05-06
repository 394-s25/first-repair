// /src/api/consultationService.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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