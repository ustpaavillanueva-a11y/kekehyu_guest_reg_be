# 📋 Frontend PDF Upload Guide - Simplified

## Feature: Upload PDF to Backend (Supabase Storage)

**What it does:** Send a PDF file from frontend to backend API, which saves it to Supabase Storage.

---

## 🔌 Backend API Endpoint

### Upload Endpoint
```
POST /api/guests/{guestId}/upload-pdf
```

**Example:**
```
POST /api/guests/550e8400-e29b-41d4-a716-446655440000/upload-pdf
```

### Required Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data  (automatic when using FormData)
```

### Request Body
- File field name: `pdf`
- Type: PDF only
- Max size: 10MB

### Success Response (Status 200)
```json
{
  "message": "PDF uploaded successfully",
  "pdfUrl": "https://vdtwpqqaluyjrdwmdgoq.supabase.co/storage/v1/object/public/guest-pdfs/pdfs/{guestId}/1234567890-filename.pdf"
}
```

### Error Responses
| Status | Problem |
|--------|---------|
| 400 | File format not PDF OR file > 10MB |
| 401 | No/invalid JWT token |
| 403 | User is not Front Desk/Super Admin |
| 404 | Guest doesn't exist |

---

## 📤 How to Upload a File

### Basic Concept
1. You have a PDF file (Blob or File object)
2. Create a **FormData** object
3. Add the PDF to FormData with field name `pdf`
4. Send POST request to backend
5. Get back the `pdfUrl`

### Step-by-Step Code

#### Step 1: Get the PDF File
```typescript
// From an input element
const fileInput = document.getElementById('pdfInput') as HTMLInputElement;
const file = fileInput.files[0];  // First selected file

// OR from JavaScript (generated PDF as Blob)
const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
```

#### Step 2: Create FormData
```typescript
const formData = new FormData();
formData.append('pdf', file);  // The field MUST be named 'pdf'
```

That's it! FormData automatically sets `Content-Type: multipart/form-data`

#### Step 3: Send to Backend
```typescript
const guestId = '550e8400-e29b-41d4-a716-446655440000';
const token = localStorage.getItem('accessToken');

const response = await fetch(
  `/api/guests/${guestId}/upload-pdf`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData  // Don't set Content-Type manually!
  }
);
```

#### Step 4: Handle Response
```typescript
if (response.ok) {
  const data = await response.json();
  console.log('✅ PDF URL:', data.pdfUrl);
  console.log('Message:', data.message);
  
  // Use the pdfUrl to:
  // - Download: window.open(data.pdfUrl)
  // - Store in database
  // - Display link to user
} else {
  const error = await response.json();
  console.error('❌ Upload failed:', error.message);
}
```

---

## 💻 Complete Example (TypeScript)

```typescript
async function uploadPdfFile(guestId: string, pdfFile: File): Promise<string> {
  // Step 1: Validate file
  if (!pdfFile || pdfFile.type !== 'application/pdf') {
    throw new Error('Only PDF files allowed');
  }
  
  if (pdfFile.size > 10 * 1024 * 1024) {  // 10MB
    throw new Error('File too large (max 10MB)');
  }

  // Step 2: Create FormData
  const formData = new FormData();
  formData.append('pdf', pdfFile);

  // Step 3: Get token
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Not logged in');
  }

  // Step 4: Send request
  try {
    const response = await fetch(
      `/api/guests/${guestId}/upload-pdf`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      }
    );

    // Step 5: Check response
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    // Step 6: Get and return URL
    const result = await response.json();
    return result.pdfUrl;

  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
```

---

## 🎯 Usage in Component

### Angular Example
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-upload',
  template: `
    <input type="file" #fileInput accept=".pdf" />
    <button (click)="uploadPdf()">Upload</button>
    <div *ngIf="loading">Uploading...</div>
    <div *ngIf="pdfUrl">
      ✅ Success! <a [href]="pdfUrl" target="_blank">Download PDF</a>
    </div>
    <div *ngIf="error" class="error">{{ error }}</div>
  `
})
export class UploadComponent {
  @ViewChild('fileInput') fileInput: any;
  
  loading = false;
  pdfUrl: string | null = null;
  error: string | null = null;
  guestId = '550e8400-e29b-41d4-a716-446655440000';

  async uploadPdf() {
    const file = this.fileInput.nativeElement.files[0];
    if (!file) return;

    this.loading = true;
    this.error = null;

    try {
      const url = await uploadPdfFile(this.guestId, file);
      this.pdfUrl = url;
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
}
```

### React Example
```typescript
import { useState } from 'react';

export function UploadPdf({ guestId }: { guestId: string }) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const url = await uploadPdfFile(guestId, file);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleUpload} />
      {loading && <p>Uploading...</p>}
      {pdfUrl && (
        <p>✅ Success! <a href={pdfUrl} target="_blank">Download PDF</a></p>
      )}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
    </div>
  );
}
```

---

## 🔴 Common Mistakes

### ❌ Wrong: Forgetting FormData
```typescript
// DON'T DO THIS
fetch('/api/guests/123/upload-pdf', {
  method: 'POST',
  body: pdfFile  // ❌ Wrong - should use FormData
});
```

### ✅ Correct: Use FormData
```typescript
// DO THIS
const formData = new FormData();
formData.append('pdf', pdfFile);
fetch('/api/guests/123/upload-pdf', {
  method: 'POST',
  body: formData  // ✅ Correct
});
```

### ❌ Wrong: Setting Content-Type manually
```typescript
// DON'T DO THIS
fetch('/api/guests/123/upload-pdf', {
  headers: {
    'Content-Type': 'multipart/form-data'  // ❌ Let browser set this
  }
});
```

### ✅ Correct: Let browser handle it
```typescript
// DO THIS - browser automatically sets correct Content-Type
fetch('/api/guests/123/upload-pdf', {
  method: 'POST',
  body: formData  // ✅ No Content-Type header needed
});
```

---

## 🧪 Quick Test

Use this in browser console to test upload:

```javascript
// 1. Get a PDF file
const input = document.createElement('input');
input.type = 'file';
input.accept = '.pdf';
input.click();

// 2. When file selected
input.onchange = async () => {
  const file = input.files[0];
  const guestId = '550e8400-e29b-41d4-a716-446655440000';
  const token = localStorage.getItem('accessToken');

  const formData = new FormData();
  formData.append('pdf', file);

  const res = await fetch(
    `/api/guests/${guestId}/upload-pdf`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    }
  );

  const data = await res.json();
  console.log(data);
}
```

---

## ℹ️ FormData Reference

```typescript
// Create
const fd = new FormData();

// Add file
fd.append('pdf', file);

// Add text
fd.append('guestId', '123');

// Multiple files (if needed)
fd.append('pdf', file1);
fd.append('pdf', file2);  // Both under same field name

// Check what's inside (for debugging)
for (const [key, value] of fd) {
  console.log(key, value);
}
```
