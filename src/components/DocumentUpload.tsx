"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface UserProfile {
  zipCode: string;
  interests: string[];
}

interface DocumentUploadProps {
  userProfile: UserProfile;
}

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
  documentId?: string;
}

export default function DocumentUpload({ userProfile }: DocumentUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle' });
  const [category, setCategory] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus({ status: 'uploading', message: 'Uploading document...' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('zipCode', userProfile.zipCode);
      formData.append('interests', JSON.stringify(userProfile.interests));

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setUploadStatus({ 
        status: 'processing', 
        message: 'Processing document with AI...',
        documentId: result.documentId 
      });

      // Poll for processing completion
      const pollProcessing = async () => {
        try {
          const statusResponse = await fetch(`/api/documents/${result.documentId}/status`);
          const statusData = await statusResponse.json();
          
          if (statusData.processed) {
            setUploadStatus({ 
              status: 'success', 
              message: 'Document processed successfully!',
              documentId: result.documentId 
            });
          } else {
            setTimeout(pollProcessing, 2000);
          }
        } catch (error) {
          setUploadStatus({ 
            status: 'error', 
            message: 'Processing failed. Please try again.' 
          });
        }
      };

      setTimeout(pollProcessing, 2000);

    } catch (error) {
      setUploadStatus({ 
        status: 'error', 
        message: 'Upload failed. Please try again.' 
      });
    }
  }, [userProfile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'
  });

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Upload className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus.status) {
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'error':
        return 'border-destructive/50 bg-destructive/10';
      case 'uploading':
      case 'processing':
        return 'border-primary/50 bg-primary/10';
      default:
        return isDragActive
          ? 'border-primary bg-primary/10'
          : 'border-border';
    }
  };

  return (
    <div className="border rounded-2xl shadow-lg" style={{backgroundColor: 'var(--card-background)', color: 'var(--foreground)', border: '1px solid var(--border)'}}>
      <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
            <Upload className="w-5 h-5" style={{color: 'var(--primary-foreground)'}} />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              Upload Government Document
            </h2>
            <p style={{color: 'var(--muted-foreground)'}}>
              Get AI-powered insights tailored to your interests
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium mb-2">Document Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            style={{backgroundColor: 'var(--secondary)', borderColor: 'var(--border)'}}
          >
            <option value="">Select a category</option>
            <option value="Meeting Notes">Meeting Notes</option>
            <option value="Policy Docs">Policy Docs</option>
            <option value="Budget Reports">Budget Reports</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${getStatusColor()}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300`} style={{backgroundColor: 'var(--secondary)'}}>
              {getStatusIcon()}
            </div>
            
            {uploadStatus.status === 'idle' && (
              <>
                <div className="space-y-1">
                  <p className="text-xl font-bold">
                    {isDragActive ? 'Drop your document here!' : 'Ready for Analysis'}
                  </p>
                  <p style={{color: 'var(--muted-foreground)'}}>
                    Drag & drop or click to select • PDF, DOC, DOCX, TXT
                  </p>
                </div>
              </>
            )}
            
            {uploadStatus.message && (
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {uploadStatus.message}
                </p>
                {(uploadStatus.status === 'uploading' || uploadStatus.status === 'processing') && (
                  <div className="mt-4 w-64 rounded-full h-2" style={{backgroundColor: 'var(--muted)'}}>
                    <div className="h-2 rounded-full animate-pulse" style={{width: uploadStatus.status === 'uploading' ? '30%' : '70%', backgroundColor: 'var(--primary)'}}></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {uploadStatus.status === 'success' && (
          <div className="mt-6 p-4 rounded-2xl border" style={{backgroundColor: 'var(--accent)', borderColor: 'var(--accent-foreground)'}}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'var(--accent-foreground)'}}>
                <CheckCircle className="w-5 h-5" style={{color: 'var(--accent)'}} />
              </div>
              <div>
                <h3 className="font-bold mb-1" style={{color: 'var(--accent-foreground)'}}>Analysis Complete!</h3>
                <p style={{color: 'var(--accent-foreground)'}}>
                  Your document has been processed. Check the dashboard for insights.
                </p>
              </div>
            </div>
          </div>
        )}

        {uploadStatus.status === 'error' && (
          <div className="mt-6 p-4 rounded-2xl border" style={{backgroundColor: 'var(--destructive)', borderColor: 'var(--destructive-foreground)'}}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'var(--destructive-foreground)'}}>
                <AlertCircle className="w-5 h-5" style={{color: 'var(--destructive)'}} />
              </div>
              <div>
                <h3 className="font-bold mb-1" style={{color: 'var(--destructive-foreground)'}}>Upload Failed</h3>
                <p style={{color: 'var(--destructive-foreground)'}}>
                  {uploadStatus.message} Please check your file format and try again.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}