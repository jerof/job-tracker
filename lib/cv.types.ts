export interface CV {
  id: string;
  userId: string;
  rawText: string;
  pdfStoragePath: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
}

// Database row type (snake_case)
export interface CVRow {
  id: string;
  user_id: string;
  raw_text: string;
  pdf_storage_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  created_at: string;
  updated_at: string;
}

// Convert database row to CV interface
export function dbToCV(row: CVRow): CV {
  return {
    id: row.id,
    userId: row.user_id,
    rawText: row.raw_text,
    pdfStoragePath: row.pdf_storage_path,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert CV to database row format
export function cvToDb(cv: Partial<CV>): Partial<CVRow> {
  const row: Partial<CVRow> = {};

  if (cv.userId !== undefined) row.user_id = cv.userId;
  if (cv.rawText !== undefined) row.raw_text = cv.rawText;
  if (cv.pdfStoragePath !== undefined) row.pdf_storage_path = cv.pdfStoragePath;
  if (cv.fileName !== undefined) row.file_name = cv.fileName;
  if (cv.fileSizeBytes !== undefined) row.file_size_bytes = cv.fileSizeBytes;

  return row;
}

// API request types
export interface CreateCVRequest {
  rawText: string;
  fileName?: string;
}

export interface UpdateCVRequest {
  rawText?: string;
  fileName?: string;
}
