// components/Header.js

import Link from 'next/link';
import { FaUpload } from 'react-icons/fa'; // Icon library

export default function Header() {
    return (
        <header className="bg-gray-800 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="text-2xl font-bold">
                    <Link href="/">Photo Gallery</Link>
                </div>
                <nav className="flex items-center space-x-6">
                    <Link href="/" className="hover:text-gray-300">Home</Link>
                    <Link href="/upload" className="flex items-center space-x-2 hover:text-gray-300">
                        <FaUpload size={24} />
                        <span>Upload</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
