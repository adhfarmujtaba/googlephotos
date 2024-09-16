// components/Layout.js

import Header from './Header';
import styles from './Layout.module.css';

export default function Layout({ children }) {
    return (
        <div>
            <Header />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
