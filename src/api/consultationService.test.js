import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db } from '../firebase/firebase_ini';
import {
    addConsultationRequest,
    getAllConsultationRequests,
    updateConsultationRequestStatus,
} from './consultationService';

// Import the functions you intend to mock AND use in your test file
import {
    addDoc as mockAddDoc,
    collection as mockCollection,
    doc as mockDoc,
    getDocs as mockGetDocs,
    orderBy as mockOrderBy,
    query as mockQuery,
    serverTimestamp as mockServerTimestamp // For controlling serverTimestamp()
    ,





    Timestamp as MockTimestamp, // For controlling Timestamp.now() and Timestamp.fromDate()
    updateDoc as mockUpdateDoc
} from 'firebase/firestore';

vi.mock('firebase/firestore', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual, // Preserve other exports like enums
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(), // if your service uses it
    orderBy: vi.fn(),
    Timestamp: { // Mock the static methods of Timestamp
      now: vi.fn(() => ({ // Simulate a Timestamp instance
        toDate: () => new Date('2023-01-01T00:00:00.000Z'), // Consistent mock date
        seconds: 1672531200,
        nanoseconds: 0,
      })),
      fromDate: vi.fn((date) => ({ // Simulate a Timestamp instance
        toDate: () => date,
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
      })),
    },
    serverTimestamp: vi.fn(() => {
      console.log('mockServerTimestamp CALLED', new Error().stack.split('\n')[2].trim()); // Log call site
      return { _methodName: 'serverTimestamp' };
    }),
  };
});

describe('Consultation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks. These are the imported mock functions.
    mockCollection.mockReset();
    mockAddDoc.mockReset();
    mockGetDocs.mockReset();
    mockUpdateDoc.mockReset();
    mockDoc.mockReset();
    mockQuery.mockReset();
    mockOrderBy.mockReset();
    MockTimestamp.now.mockReset();
    MockTimestamp.fromDate.mockReset();
    mockServerTimestamp.mockReset();


    // Default mock implementations
    mockCollection.mockReturnValue({ id: 'consultationRequestsCollectionRef' });
    mockDoc.mockImplementation((dbRef, collectionPath, docId) => ({
      id: docId || 'mockDocId',
      path: `${collectionPath}/${docId || 'mockDocId'}`,
      _converter: null,
    }));
    mockQuery.mockImplementation((collectionRef, ...constraints) => ({
      _collectionRef: collectionRef,
      _constraints: constraints,
      withConverter: vi.fn().mockReturnThis(),
    }));
    // Simulate what an orderBy constraint object might look like if your code inspects it
    mockOrderBy.mockImplementation((fieldPath, directionStr) => ({
        _field: fieldPath,
        _direction: directionStr,
        type: 'orderBy'
    }));
  });

  describe('addConsultationRequest', () => {
    test('should add a document to Firestore with correct data and server timestamp', async () => {
      const requestData = { name: 'Test User', email: 'test@example.com' };
      const mockId = 'newMockId';
      mockAddDoc.mockResolvedValue({ id: mockId });

      // Call the function under test
      const result = await addConsultationRequest(requestData);

      // Assert that mockServerTimestamp was called once by the service
      expect(mockServerTimestamp).toHaveBeenCalledTimes(1); // <<<< FAILING LINE

      expect(mockCollection).toHaveBeenCalledWith(db, 'consultationRequests');
      expect(mockAddDoc).toHaveBeenCalledWith(
        { id: 'consultationRequestsCollectionRef' },
        expect.objectContaining({
          ...requestData,
          status: 'pending',
          createdAt: mockServerTimestamp.mock.results[0].value, 
        })
      );
      expect(result).toEqual({ success: true, id: mockId });
    });

    test('should return success false on Firestore error', async () => {
      const requestData = { name: 'Test User', email: 'test@example.com' };
      const firestoreError = new Error('Firestore error');
      mockAddDoc.mockRejectedValue(firestoreError);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await addConsultationRequest(requestData);

      expect(result).toEqual({ success: false, error: firestoreError });
      expect(console.error).toHaveBeenCalledWith('Error adding consultation request: ', firestoreError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getAllConsultationRequests', () => {
    test('should retrieve and map consultation requests', async () => {
      const mockDate = new Date('2023-01-15T10:30:00Z');
      // This mock data structure is what doc.data() will return from Firestore
      // The `createdAt` field has a `toDate` method, simulating a Firestore Timestamp
      const mockFirestoreDocs = [
        { id: '1', data: () => ({ name: 'User A', createdAt: { toDate: () => mockDate, seconds: 1673778600, nanoseconds: 0 } }) },
        { id: '2', data: () => ({ name: 'User B', createdAt: { toDate: () => mockDate, seconds: 1673778600, nanoseconds: 0 } }) },
      ];
      mockGetDocs.mockResolvedValue({
        docs: mockFirestoreDocs,
        forEach: (callback) => mockFirestoreDocs.forEach(callback) // if your service uses forEach
      });

      const result = await getAllConsultationRequests();

      expect(mockCollection).toHaveBeenCalledWith(db, 'consultationRequests');
      const expectedOrderByConstraint = { _field: 'createdAt', _direction: 'desc', type: 'orderBy' };
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      const queryConstraint = mockOrderBy.mock.results[0].value; // Get the object returned by mockOrderBy
      expect(mockQuery).toHaveBeenCalledWith({ id: 'consultationRequestsCollectionRef' }, queryConstraint);
      const queryObj = mockQuery.mock.results[0].value; // Get the object returned by mockQuery
      expect(mockGetDocs).toHaveBeenCalledWith(queryObj);

      expect(result.success).toBe(true);
      // This assertion expects that your service has called .toDate() on createdAt
      expect(result.data).toEqual([
        { id: '1', name: 'User A', createdAt: mockDate },
        { id: '2', name: 'User B', createdAt: mockDate },
      ]);
    });

    test('should return success false on Firestore error', async () => {
      const firestoreError = new Error('Firestore error');
      mockGetDocs.mockRejectedValue(firestoreError);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getAllConsultationRequests();

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('Firestore error');
      // If your function explicitly returns a data array on error, uncomment:
      // expect(result.data).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error fetching all consultation requests: ', firestoreError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateConsultationRequestStatus', () => {
    test('should update the status of a specific request', async () => {
      const requestId = 'req123';
      const newStatus = 'approved';
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await updateConsultationRequestStatus(requestId, newStatus);

      const expectedDocRef = { id: requestId, path: `consultationRequests/${requestId}`, _converter: null };
      expect(mockDoc).toHaveBeenCalledWith(db, 'consultationRequests', requestId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expectedDocRef, // The object returned by mockDoc
        { status: newStatus }
      );
      expect(result).toEqual({ success: true });
    });

    test('should return success false on Firestore error', async () => {
      const firestoreError = new Error('Firestore error');
      mockUpdateDoc.mockRejectedValue(firestoreError);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await updateConsultationRequestStatus('req123', 'approved');

      expect(result).toEqual({ success: false, error: firestoreError });
      expect(console.error).toHaveBeenCalledWith('Error updating request status: ', firestoreError);
      consoleErrorSpy.mockRestore();
    });
  });
});