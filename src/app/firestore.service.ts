import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, setDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);

  getCollection(collectionName: string): Observable<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    return collectionData(collectionRef, { idField: 'id' });
  }

  async getDocument(collectionName: string, documentId: string): Promise<any> {
    const docRef = doc(this.firestore, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async setDocument(collectionName: string, documentId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, documentId);
    await setDoc(docRef, data);
  }

  async updateDocument(collectionName: string, documentId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, documentId);
    await updateDoc(docRef, data);
  }

  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    const docRef = doc(this.firestore, collectionName, documentId);
    await deleteDoc(docRef);
  }
}

