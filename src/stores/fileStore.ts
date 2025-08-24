import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ExcelFileData, ValidationResult } from '@/types/excel';

interface FileState {
  // Current files
  inventoryFile: ExcelFileData | null;
  osrFile: ExcelFileData | null;
  
  // Upload state
  isUploading: boolean;
  uploadProgress: number;
  validationResults: ValidationResult[];
  
  // File management
  activeDataSources: ('inventory' | 'osr')[];
  
  // Actions
  setInventoryFile: (file: ExcelFileData) => void;
  setOsrFile: (file: ExcelFileData) => void;
  clearFile: (fileType: 'inventory' | 'osr') => void;
  clearAllFiles: () => void;
  setUploadProgress: (progress: number) => void;
  setValidationResults: (results: ValidationResult[]) => void;
  setUploading: (uploading: boolean) => void;
  
  // Computed getters
  hasInventoryData: () => boolean;
  hasOSRData: () => boolean;
  hasBothDataSources: () => boolean;
  getActiveFileCount: () => number;
}

export const useFileStore = create<FileState>()(
  devtools(
    (set, get) => ({
      // Initial state
      inventoryFile: null,
      osrFile: null,
      isUploading: false,
      uploadProgress: 0,
      validationResults: [],
      activeDataSources: [],
      
      // Actions
      setInventoryFile: (file) => 
        set((state) => ({
          inventoryFile: file,
          activeDataSources: [...new Set([...state.activeDataSources, 'inventory' as const])]
        }), false, 'setInventoryFile'),
      
      setOsrFile: (file) => 
        set((state) => ({
          osrFile: file,
          activeDataSources: [...new Set([...state.activeDataSources, 'osr' as const])]
        }), false, 'setOsrFile'),
      
      clearFile: (fileType) => 
        set((state) => ({
          [fileType === 'inventory' ? 'inventoryFile' : 'osrFile']: null,
          activeDataSources: state.activeDataSources.filter(source => source !== fileType)
        }), false, 'clearFile'),
      
      clearAllFiles: () => 
        set({
          inventoryFile: null,
          osrFile: null,
          activeDataSources: [],
          validationResults: [],
          uploadProgress: 0
        }, false, 'clearAllFiles'),
      
      setUploadProgress: (progress) => 
        set({ uploadProgress: progress }, false, 'setUploadProgress'),
      
      setValidationResults: (results) => 
        set({ validationResults: results }, false, 'setValidationResults'),
      
      setUploading: (uploading) => 
        set({ isUploading: uploading }, false, 'setUploading'),
      
      // Computed getters
      hasInventoryData: () => get().inventoryFile !== null,
      hasOSRData: () => get().osrFile !== null,
      hasBothDataSources: () => get().inventoryFile !== null && get().osrFile !== null,
      getActiveFileCount: () => get().activeDataSources.length,
    }),
    {
      name: 'file-store'
    }
  )
);