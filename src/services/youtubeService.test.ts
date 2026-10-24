import test from 'node:test';
import assert from 'node:assert/strict';
import {
  API_KEY,
  CHANNEL_ID,
  UPLOADS_PLAYLIST_ID,
  CHANNEL_URL,
  formatVideoDate,
  getLatestVideos
} from './youtubeService';

test('Channel constants and permanent API key match user specification', () => {
  assert.equal(API_KEY, 'AIzaSyDV754ROGEUEKioxFHGceXBV5PCIav-PMI');
  assert.equal(CHANNEL_ID, 'UCwWs_spTAEZaojGQDQSYQ-A');
  assert.equal(UPLOADS_PLAYLIST_ID, 'UUwWs_spTAEZaojGQDQSYQ-A');
  assert.equal(CHANNEL_URL, 'https://www.youtube.com/channel/UCwWs_spTAEZaojGQDQSYQ-A');
});

test('formatVideoDate formats ISO date to PT-BR correctly', () => {
  const formatted = formatVideoDate('2026-10-23T23:23:18Z');
  assert.ok(formatted.includes('2026'));
  assert.ok(formatted.includes('outubro') || formatted.includes('Outubro'));
});

test('getLatestVideos returns official videos from YouTube API', async () => {
  const videos = await getLatestVideos(8);
  assert.ok(Array.isArray(videos));
  assert.ok(videos.length > 0, 'Must return at least 1 video from the official channel');
  assert.ok(videos[0].id.length > 0);
  assert.ok(videos[0].title.length > 0);
  assert.ok(videos[0].videoUrl.startsWith('https://www.youtube.com/watch?v='));
});
