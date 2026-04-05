export interface WebcamEntry {
  webcamId: string;
  lat: number;
  lng: number;
  category: string;
  title: string;
  name?: string;
  country: string;
}

export interface WebcamCluster {
  lat: number;
  lng: number;
  count: number;
  categories?: string[];
}

export interface ListWebcamsResponse {
  webcams: WebcamEntry[];
  clusters: WebcamCluster[];
  totalInView: number;
}

export interface GetWebcamImageResponse {
  thumbnailUrl: string;
  playerUrl: string;
  title: string;
  windyUrl: string;
  lastUpdated: string;
  error?: string;
}

export interface PinnedWebcam {
  webcamId: string;
  title: string;
  lat: number;
  lng: number;
  category: string;
  country: string;
  playerUrl: string;
  active: boolean;
  pinnedAt: number;
}

const EMPTY_RESPONSE: ListWebcamsResponse = { webcams: [], clusters: [], totalInView: 0 };

export async function fetchWebcams(
  _zoom: number,
  _bounds: { w: number; s: number; e: number; n: number },
): Promise<ListWebcamsResponse> {
  return EMPTY_RESPONSE;
}

export async function fetchWebcamImage(webcamId: string): Promise<GetWebcamImageResponse> {
  return {
    thumbnailUrl: '',
    playerUrl: '',
    title: '',
    windyUrl: `https://www.windy.com/webcams/${webcamId}`,
    lastUpdated: '',
    error: 'removed',
  };
}

export function getClusterCellSize(_zoom: number): number {
  return 1;
}

export function getCategoryStyle(_category: string): { color: string; emoji: string } {
  return { color: '#888888', emoji: 'CAM' };
}

export function getPinnedWebcams(): PinnedWebcam[] {
  return [];
}

export function getActiveWebcams(): PinnedWebcam[] {
  return [];
}

export function isPinned(_webcamId: string): boolean {
  return false;
}

export function pinWebcam(_webcam: Omit<PinnedWebcam, 'active' | 'pinnedAt'>): void {
  // Webcam feature removed.
}

export function unpinWebcam(_webcamId: string): void {
  // Webcam feature removed.
}

export function toggleWebcam(_webcamId: string): void {
  // Webcam feature removed.
}

export function onPinnedChange(_handler: () => void): () => void {
  return () => undefined;
}