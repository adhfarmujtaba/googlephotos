import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // Import Lightbox styles

const ImagePage = () => {
    const router = useRouter();
    const { slug } = router.query;
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        const fetchImageData = async () => {
            if (slug) {
                try {
                    const response = await axios.get(`https://kahsmiradventures.in/google_phtos/get_image_by_slug.php?slug=${slug}`);
                    const data = response.data;

                    if (data.success) {
                        if (data.image.public_access) {
                            setImageData(data.image);
                        } else {
                            setError('This image is not publicly accessible.');
                        }
                    } else {
                        setError(data.message || 'Image not found');
                    }
                } catch (error) {
                    console.error('Error fetching image data:', error);
                    setError('Failed to load image');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchImageData();
    }, [slug]);

    const handleDownload = async () => {
        if (imageData) {
            try {
                const response = await axios.get(`/api/imageProxy?url=https://kahsmiradventures.in/google_phtos/uploads/${imageData.filename}`, {
                    responseType: 'blob',
                });
                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = imageData.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading image:', error);
                alert('Failed to download image');
            }
        }
    };

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-600 text-center mt-8">{error}</div>;
    }

    if (!imageData) {
        return <div className="text-center mt-8">No image data found.</div>;
    }

    const imageUrl = `/api/imageProxy?url=https://kahsmiradventures.in/google_phtos/uploads/${imageData.filename}`;

    return (
        <div style={styles.container}>
            <div style={styles.imageWrapper} onClick={() => setIsLightboxOpen(true)}>
                <Image
                    src={imageUrl}
                    alt={imageData.filename}
                    width={1200}
                    height={800}
                    layout="responsive"
                    quality={100}
                    style={styles.image}
                />
                <button
                    onClick={handleDownload}
                    style={styles.downloadButton}
                    title="Download"
                >
                    <FaDownload />
                </button>
            </div>
            {isLightboxOpen && (
                <Lightbox
                    mainSrc={imageUrl}
                    onCloseRequest={() => setIsLightboxOpen(false)}
                />
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        textAlign: 'center',
        cursor: 'pointer' // Added cursor pointer to indicate clickable area
    },
    image: {
        borderRadius: '8px'
    },
    downloadButton: {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        padding: '10px',
        cursor: 'pointer',
        fontSize: '24px',
        transition: 'background-color 0.3s',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
};

export default ImagePage;
