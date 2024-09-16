import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { FaDownload, FaShareAlt, FaLock, FaUnlock } from 'react-icons/fa';
import { MdLink } from 'react-icons/md';

export default function Gallery() {
    const [photos, setPhotos] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentDate, setCurrentDate] = useState('');
    
    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await axios.get('https://kahsmiradventures.in/google_phtos/get_photos.php');
                console.log('Fetched photos:', response.data);

                if (Array.isArray(response.data)) {
                    const groupedPhotos = response.data.reduce((acc, photo) => {
                        const date = new Date(photo.uploaded_at).toDateString();
                        if (!acc[date]) {
                            acc[date] = [];
                        }
                        acc[date].push(photo);
                        return acc;
                    }, {});
                    
                    setPhotos(groupedPhotos);
                    if (Object.keys(groupedPhotos).length > 0) {
                        setCurrentDate(Object.keys(groupedPhotos)[0]);
                    }
                } else {
                    console.error('Unexpected response format:', response.data);
                    setPhotos({});
                }
            } catch (error) {
                console.error('Error fetching photos:', error);
                setError('Failed to fetch photos.');
                setPhotos({});
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, []);

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setIsOpen(true);
    };

    const handleUpdateAccess = async () => {
        const currentPhoto = photos[currentDate]?.[currentImageIndex];
        if (currentPhoto) {
            try {
                const response = await axios.post('https://kahsmiradventures.in/google_phtos/make_private.php', { id: currentPhoto.id, public_access: false, slug: null });
                const data = response.data;

                if (data.success) {
                    setPhotos(prevPhotos => {
                        const updatedPhotos = { ...prevPhotos };
                        const updatedPhoto = updatedPhotos[currentDate]?.find(photo => photo.id === currentPhoto.id);
                        
                        if (updatedPhoto) {
                            updatedPhoto.public_access = false;
                            updatedPhoto.slug = null;
                        }

                        return updatedPhotos;
                    });

                    alert('Photo access updated to private.');
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error('Error updating photo access:', error);
                alert('Failed to update photo access.');
            }
        }
    };

    const handleShareClick = async () => {
        const currentPhoto = photos[currentDate]?.[currentImageIndex];
        if (currentPhoto) {
            try {
                const response = await axios.post('https://kahsmiradventures.in/google_phtos/update_photo.php', { id: currentPhoto.id });
                const data = response.data;

                if (data.success) {
                    const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                    const shareableUrl = `${currentDomain}/images/${data.slug}`;
                    
                    setPhotos(prevPhotos => {
                        const updatedPhotos = { ...prevPhotos };
                        const updatedPhoto = updatedPhotos[currentDate]?.find(photo => photo.id === currentPhoto.id);
                        
                        if (updatedPhoto) {
                            updatedPhoto.public_access = true;
                            updatedPhoto.slug = data.slug;
                        }

                        return updatedPhotos;
                    });

                    alert(`Shareable link generated: ${shareableUrl}`);
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error('Error updating photo:', error);
                alert('Failed to generate shareable link.');
            }
        }
    };

    const images = photos[currentDate]?.map(photo => `https://kahsmiradventures.in/google_phtos/uploads/${photo.filename}`) || [];

    const getImageCaption = () => {
        const currentPhoto = photos[currentDate]?.[currentImageIndex];
        const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const shareableUrl = currentPhoto && currentPhoto.slug ? `${currentDomain}/images/${currentPhoto.slug}` : '';

        const handleDownload = async () => {
            if (currentPhoto) {
                try {
                    const response = await axios.get(`/api/imageProxy?url=https://kahsmiradventures.in/google_phtos/uploads/${currentPhoto.filename}`, {
                        responseType: 'blob',
                    });
                    const blob = new Blob([response.data], { type: response.headers['content-type'] });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = currentPhoto.filename;
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

        return (
            <div style={styles.captionContainer}>
                <div style={styles.buttonRow}>
                    <button
                        onClick={handleDownload}
                        style={styles.iconButton}
                        title="Download"
                    >
                        <FaDownload />
                    </button>
                    {!currentPhoto?.slug ? (
                        <button
                            onClick={handleShareClick}
                            style={styles.iconButton}
                            title="Share"
                        >
                            <FaShareAlt />
                        </button>
                    ) : (
                        <a
                            href={shareableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.iconButton}
                            title="Copy Link"
                        >
                            <MdLink />
                        </a>
                    )}
                    {currentPhoto?.public_access && currentPhoto?.slug ? (
                        <button
                            onClick={handleUpdateAccess}
                            style={styles.iconButton}
                            title="Make Private"
                        >
                            <FaLock />
                        </button>
                    ) : (
                        currentPhoto && (
                            <button
                                onClick={handleUpdateAccess}
                                style={styles.iconButton}
                                title="Make Public"
                            >
                                <FaUnlock />
                            </button>
                        )
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Photo Gallery</h1>
            <div>
                {loading ? (
                    <div style={styles.grid}>
                        {Array.from({ length: 9 }).map((_, index) => (
                            <div key={index} style={styles.skeletonContainer}>
                                <Skeleton height={300} width={300} />
                            </div>
                        ))}
                    </div>
                ) : Object.keys(photos).length > 0 ? (
                    Object.entries(photos).map(([date, photosList]) => (
                        <div key={date} style={styles.dateSection}>
                            <h2
                                style={styles.dateHeader}
                                onClick={() => setCurrentDate(date)}
                            >
                                {date}
                            </h2>
                            <div style={styles.grid}>
                                {photosList.map((photo, index) => (
                                    <div
                                        key={photo.filename}
                                        style={styles.photoContainer}
                                        onClick={() => {
                                            setCurrentDate(date);
                                            openLightbox(index);
                                        }}
                                    >
                                        <div style={styles.photoWrapper}>
                                            <Image
                                                src={`https://kahsmiradventures.in/google_phtos/uploads/${photo.filename}`}
                                                alt={photo.filename}
                                                width={300}
                                                height={300}
                                                layout="responsive"
                                                quality={75}
                                                style={styles.image}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={styles.noPhotos}>No photos available.</p>
                )}
            </div>

            {isOpen && (
                <Lightbox
                    mainSrc={images[currentImageIndex]}
                    nextSrc={images[(currentImageIndex + 1) % images.length]}
                    prevSrc={images[(currentImageIndex + images.length - 1) % images.length]}
                    onCloseRequest={() => setIsOpen(false)}
                    onMovePrevRequest={() => setCurrentImageIndex((currentImageIndex + images.length - 1) % images.length)}
                    onMoveNextRequest={() => setCurrentImageIndex((currentImageIndex + 1) % images.length)}
                    reactModalStyle={{ overlay: { zIndex: 1000 } }}
                    imageCaption={getImageCaption()}
                />
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
    },
    header: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#333',
        textAlign: 'center'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    skeletonContainer: {
        backgroundColor: '#e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    dateSection: {
        marginBottom: '40px'
    },
    dateHeader: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#666',
        cursor: 'pointer'
    },
    photoContainer: {
        cursor: 'pointer',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    photoWrapper: {
        borderRadius: '8px',
        overflow: 'hidden'
    },
    image: {
        borderRadius: '8px'
    },
    captionContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#333',
        color: '#fff'
    },
    buttonRow: {
        display: 'flex',
        gap: '10px'
    },
    iconButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '20px',
        transition: 'color 0.3s',
        padding: '10px'
    },
    noPhotos: {
        textAlign: 'center',
        color: '#777'
    },
    error: {
        color: '#f44336',
        textAlign: 'center',
        marginTop: '20px'
    }
};
