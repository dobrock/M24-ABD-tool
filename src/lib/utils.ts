// src/lib/utils.ts
export const getFileUrl = (filePath: string | undefined, vorgangId: string | undefined): string => {
    if (!filePath || !vorgangId) return '';
    return filePath.startsWith('http')
      ? filePath
      : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/download/${vorgangId}/${encodeURIComponent(filePath.split('/').pop()!)}`;
  };
  