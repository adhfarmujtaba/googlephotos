import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircleIcon } from '@heroicons/react/24/solid'; // You can use any icon or component for completion sign

export default function Upload() {
    const [files, setFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('Please select files first.');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }

        setUploading(true);

        try {
            const response = await axios.post('https://kahsmiradventures.in/google_phtos/upload.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (event) => {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setProgress(percent);
                },
            });

            if (response.data.status === 'success') {
                toast.success('Upload successful!');
                setUploadComplete(true);
            } else {
                toast.error(`Upload failed: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed.');
        } finally {
            setUploading(false);
            setProgress(0); // Reset progress bar after upload
        }
    };

    const handleUploadMore = () => {
        setUploadComplete(false);
        setFiles([]);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            {!uploadComplete ? (
                <>
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Upload Photos</h1>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="mb-4 border border-gray-300 rounded-lg p-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className={`px-4 py-2 font-semibold text-white rounded-lg ${uploading ? 'bg-gray-400' : 'bg-indigo-500 hover:bg-indigo-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    {uploading && (
                        <div className="mt-4 w-full max-w-xs">
                            <progress
                                value={progress}
                                max="100"
                                className="w-full h-2 bg-gray-200 rounded-full"
                            ></progress>
                            <span className="block text-center mt-2 text-gray-700">{progress}%</span>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center">
                    <CheckCircleIcon className="w-24 h-24 text-green-500 mb-4" />
                    <p className="text-lg font-semibold mb-4">Upload Complete!</p>
                    <button
                        onClick={handleUploadMore}
                        className="px-4 py-2 font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Upload More Files
                    </button>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}
