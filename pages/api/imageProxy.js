// pages/api/imageProxy.js
import axios from 'axios';

export default async function handler(req, res) {
    const { url } = req.query;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.setHeader('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch image' });
    }
}
