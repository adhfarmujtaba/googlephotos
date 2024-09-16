// pages/_app.js

import Layout from '../components/Layout';
import '../styles/globals.css'; // Ensure you import global styles if you have any

function MyApp({ Component, pageProps }) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

export default MyApp;
