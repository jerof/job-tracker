'use client';

import { useState, useEffect } from 'react';
import { CV } from '@/lib/types';
import CVCard from './CVCard';
import MasterCVCard from './MasterCVCard';
import CVPreviewModal from './CVPreviewModal';

type FilterType = 'all' | 'master' | 'tailored';

interface CVGridProps {
  onEditMaster: () => void;
  onAddMaster: () => void;
}

export default function CVGrid({ onEditMaster, onAddMaster }: CVGridProps) {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [previewCV, setPreviewCV] = useState<CV | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CV | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCVs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cvs');
      if (response.ok) {
        const data = await response.json();
        setCvs(data.cvs || []);
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  const handleDelete = async (cv: CV) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cvs/${cv.id}`, { method: 'DELETE' });
      if (response.ok) {
        setCvs(prev => prev.filter(c => c.id !== cv.id));
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const masterCV = cvs.find(cv => cv.type === 'master');
  const tailoredCVs = cvs.filter(cv => cv.type === 'tailored');

  const filteredCVs = filter === 'all'
    ? cvs
    : filter === 'master'
    ? cvs.filter(cv => cv.type === 'master')
    : tailoredCVs;

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: cvs.length },
    { id: 'master', label: 'Master', count: masterCV ? 1 : 0 },
    { id: 'tailored', label: 'Tailored', count: tailoredCVs.length },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Filter skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no CVs at all
  if (cvs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No CVs yet</h3>
        <p className="text-gray-500 text-sm mb-6">Add your master CV to get started</p>
        <button
          onClick={onAddMaster}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-sm shadow-amber-500/25 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Master CV
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === f.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-xs ${
              filter === f.id ? 'text-gray-400' : 'text-gray-400'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Master CV always first when showing all or master filter */}
        {(filter === 'all' || filter === 'master') && (
          <MasterCVCard
            cv={masterCV || null}
            onEdit={onEditMaster}
            onAdd={onAddMaster}
          />
        )}

        {/* Tailored CVs */}
        {(filter === 'all' || filter === 'tailored') && tailoredCVs.map(cv => (
          <CVCard
            key={cv.id}
            cv={cv}
            onPreview={setPreviewCV}
            onDelete={setDeleteConfirm}
          />
        ))}
      </div>

      {/* Empty state for filtered view */}
      {filter === 'tailored' && tailoredCVs.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No tailored CVs yet</h3>
          <p className="text-gray-500 text-sm">Generate one from an application</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewCV && (
        <CVPreviewModal
          cv={previewCV}
          onClose={() => setPreviewCV(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete CV?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will permanently delete {deleteConfirm.filename}. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
