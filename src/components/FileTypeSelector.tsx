import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { FileText, TrendingUp } from 'lucide-react';

export type FileType = 'inventory' | 'osr';

interface FileTypeSelectorProps {
  value?: FileType;
  onChange: (fileType: FileType) => void;
  disabled?: boolean;
  className?: string;
}

export const FileTypeSelector: React.FC<FileTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  const getDisplayLabel = (fileType?: FileType) => {
    if (!fileType) return '';
    return fileType === 'inventory' ? 'Inventory' : 'OSR';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        File Type
      </label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as FileType)}
        disabled={disabled}
      >
        <SelectTrigger className="w-60" data-testid="file-type-selector">
          {value ? (
            <span>{getDisplayLabel(value)}</span>
          ) : (
            <span className="text-gray-500">Select file type to upload</span>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inventory">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium">INVENTORY File</div>
                <div className="text-xs text-gray-500">
                  Contains FG value and RPM sheets
                </div>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="osr">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              <div>
                <div className="font-medium">OSR File</div>
                <div className="text-xs text-gray-500">
                  Contains OSR Main Sheet HC and OSR Summary
                </div>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};