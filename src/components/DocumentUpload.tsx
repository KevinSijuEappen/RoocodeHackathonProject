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
        return 'border-green-300 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-300 bg-red-50 dark:bg-red-900/20';
      case 'uploading':
      case 'processing':
        return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20';
      default:
        return isDragActive 
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📤 Upload Government Document
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Get AI-powered insights tailored to your interests
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${getStatusColor()}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              uploadStatus.status === 'success' ? 'bg-green-100 dark:bg-green-900/50' :
              uploadStatus.status === 'error' ? 'bg-red-100 dark:bg-red-900/50' :
              uploadStatus.status === 'uploading' || uploadStatus.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/50' :
              'bg-gray-100 dark:bg-gray-700'
            }`}>
              {getStatusIcon()}
            </div>
            
            {uploadStatus.status === 'idle' && (
              <>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isDragActive ? '🎯 Drop your document here!' : '📄 Ready for Analysis'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Drag & drop or click to select • PDF, DOC, DOCX, TXT
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
                  <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-2">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Meeting Notes</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-2">
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Policy Docs</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-2">
                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Reports</span>
                  </div>
                </div>
              </>
            )}
            
            {uploadStatus.message && (
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {uploadStatus.message}
                </p>
                {(uploadStatus.status === 'uploading' || uploadStatus.status === 'processing') && (
                  <div className="mt-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse" style={{width: uploadStatus.status === 'uploading' ? '30%' : '70%'}}></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {uploadStatus.status === 'success' && (
          <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">🎉 Analysis Complete!</h3>
                <p className="text-green-700 dark:text-green-300">
                  Your document has been processed and analyzed with AI! Switch to the Document Dashboard to see personalized insights based on your interests in <span className="font-semibold">{userProfile.zipCode}</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {uploadStatus.status === 'error' && (
          <div className="mt-6 p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200/50 dark:border-red-800/50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">Upload Failed</h3>
                <p className="text-red-700 dark:text-red-300">
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