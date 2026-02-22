export declare const YoutubeTranscript: {
  fetchTranscript(
    videoId: string,
    options?: {lang?: string}
  ): Promise<Array<{text: string; start?: number; offset?: number}>>;
};
