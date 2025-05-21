import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db } from '../firebase/firebase_ini';
import { exportToSpreadsheet } from './spreadsheetService';

// Mock 'firebase/firestore'
// Import the functions you intend to mock AND use in your test file
import { collection, getDocs as mockGetDocs } from 'firebase/firestore';

vi.mock('firebase/firestore', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    collection: vi.fn(),
    getDocs: vi.fn(), // This is the mock function that will be used by the service
  };
});

// DOM Mocks
const mockLink = {
  setAttribute: vi.fn(),
  click: vi.fn(),
  style: { visibility: '' }, // Ensure style property exists
};
const mockCreateElement = vi.fn(() => mockLink);
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateObjectURL = vi.fn(() => 'mock-blob-url');

// Assign to global for the service to use
global.document = {
  createElement: mockCreateElement,
  body: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild,
  },
};
global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: vi.fn(), // Good practice to mock this too
};
// Mock Blob constructor
global.Blob = vi.fn((content, options) => ({
  content,
  options,
  size: content.join ? content.join('').length : 0, // Handle if content is not an array
  type: options ? options.type : '',
}));


describe('Spreadsheet Service - exportToSpreadsheet', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clears all mocks, including DOM and Firebase

    // Reset specific mocks for clarity and to ensure clean state
    mockLink.setAttribute.mockReset();
    mockLink.click.mockReset();
    mockCreateElement.mockReset();
    mockAppendChild.mockReset();
    mockRemoveChild.mockReset();
    mockCreateObjectURL.mockReset();
    global.Blob.mockReset();
    global.URL.revokeObjectURL.mockReset();


    // collection is already the vi.fn() from the module mock, just set its return value
    collection.mockReturnValue({ id: 'consultationRequestsCollectionRef' });
    // mockGetDocs is the imported mock we can control
    mockGetDocs.mockReset(); // Ensure it's clean for each test
  });

  test('should successfully fetch data, create a CSV, and trigger download', async () => {
    const mockDate = new Date(2023, 0, 15, 10, 30, 0); // Jan 15, 2023, 10:30:00
    const mockFirestoreData = [
      {
        id: 'req1',
        data: () => ({
          name: 'Alice Wonderland',
          organization: 'Tea Party Inc.',
          email: 'alice@example.com',
          phone: '111-222-3333',
          stage: 'Exploring',
          otherStageDetail: '',
          topics: ['Madness', 'Hats'],
          additionalContext: 'Down the rabbit hole',
          location: { address: 'Wonderland Lane' },
          status: 'pending',
          createdAt: { toDate: () => mockDate }, // Simulates Firestore Timestamp
        }),
      },
      {
        id: 'req2',
        data: () => ({
          name: 'Bob The Builder',
          organization: '', // Empty organization
          email: 'bob@example.com',
          phone: '444-555-6666',
          stage: 'Building',
          otherStageDetail: 'With bricks',
          topics: ['Construction'], // Single topic
          additionalContext: 'Can we fix it?',
          location: null, // No location
          status: 'approved',
          createdAt: { toDate: () => mockDate }, // Simulates Firestore Timestamp
        }),
      },
    ];
    // Configure the mock for getDocs
    mockGetDocs.mockResolvedValue({
      forEach: (callback) => mockFirestoreData.forEach(callback), // if service uses forEach
      docs: mockFirestoreData, // if service uses .docs
    });

    const result = await exportToSpreadsheet();

    // 1. Verify Firebase calls
    expect(collection).toHaveBeenCalledWith(db, 'consultationRequests');
    expect(mockGetDocs).toHaveBeenCalledWith({ id: 'consultationRequestsCollectionRef' });

    // 2. Verify Blob creation
    expect(global.Blob).toHaveBeenCalledTimes(1);
    const blobArgs = global.Blob.mock.calls[0];
    const csvContentArray = blobArgs[0]; // This should be an array of strings (CSV rows)
    const csvContent = csvContentArray.join(''); // Join without newline for simple containment checks, or with \n for full line checks

    // Check headers (ensure your service actually adds a newline after headers)
    expect(csvContent).toContain('ID,Name,Organization,Email,Phone,Stage,Other Stage Detail,Topics,Additional Context,Location,Status,Created At');
    // Check Alice's data (ensure proper CSV quoting and formatting by your service)
    // Note: The toLocaleString() can vary by environment, be mindful if this causes flaky tests.
    // Consider a more stable date string format if needed.
    expect(csvContent).toContain('req1,"Alice Wonderland","Tea Party Inc.","alice@example.com","111-222-3333","Exploring","","Madness, Hats","Down the rabbit hole","Wonderland Lane","pending","' + mockDate.toLocaleString() + '"');
    // Check Bob's data
    expect(csvContent).toContain('req2,"Bob The Builder","","bob@example.com","444-555-6666","Building","With bricks","Construction","Can we fix it?","","approved","' + mockDate.toLocaleString() + '"');


    // 3. Verify DOM manipulation for download
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockCreateObjectURL).toHaveBeenCalledWith(global.Blob.mock.results[0].value); // Check it was called with the blob instance
    expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-blob-url');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('consultation_requests_')); // Filename check
    expect(mockLink.style.visibility).toBe('hidden');
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalledTimes(1);
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url'); // Check if blob URL was revoked

    // 4. Verify success return
    expect(result).toEqual({ success: true });
  });

  test('should return success false if Firestore getDocs fails', async () => {
    const firestoreError = new Error('Firestore unavailable');
    mockGetDocs.mockRejectedValue(firestoreError); // Configure getDocs to fail
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    const result = await exportToSpreadsheet();

    expect(result).toEqual({ success: false, error: firestoreError });
    expect(console.error).toHaveBeenCalledWith('Error exporting to spreadsheet:', firestoreError);
    
    // Ensure DOM manipulation for download was not attempted
    expect(mockCreateElement).not.toHaveBeenCalled();
    expect(mockLink.click).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('should handle empty data from Firestore', async () => {
    mockGetDocs.mockResolvedValue({
      forEach: (callback) => [].forEach(callback),
      docs: [],
    });

    const result = await exportToSpreadsheet();

    expect(global.Blob).toHaveBeenCalledTimes(1);
    const blobArgs = global.Blob.mock.calls[0];
    const csvContentArray = blobArgs[0];
    // Expect only headers if data is empty
    expect(csvContentArray.length).toBe(1); // Or 2 if you add an empty line after headers
    expect(csvContentArray[0]).toContain('ID,Name,Organization,Email,Phone,Stage,Other Stage Detail,Topics,Additional Context,Location,Status,Created At');

    expect(result).toEqual({ success: true });
    // Check that download was still attempted
    expect(mockLink.click).toHaveBeenCalledTimes(1);
  });
});