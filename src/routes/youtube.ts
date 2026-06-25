import { Router, Response } from 'express';
const router = Router();

// GET /api/youtube/search?q=lesson+title
router.get('/search', async (req: any, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) return res.status(400).json({ message: 'q is required' });
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(q + ' tutorial')}&key=${process.env.YOUTUBE_API_KEY}`;
    const resp = await fetch(url);
    const data: any = await resp.json();
    if (!data.items?.length) return res.status(404).json({ message: 'No video found' });
    const item = data.items[0];
    return res.json({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
