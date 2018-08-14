import { MediaTitle, CoverImage, FuzzyDateInt, MediaFormat, MediaStatus, MediaTrailer, MediaSource, AiringSchedule, MediaRanking, MediaExternalLink, MediaSeason } from '../../index';

interface MediaPageInline {
    id: number;
    volumes: number;
    siteUrl: string;
    duration: number;
    episodes: number;
    chapters: number;
    isAdult: boolean;
    title: MediaTitle;
    season: MediaSeason;
    status: MediaStatus;
    format: MediaFormat;
    source: MediaSource;
    bannerImage: string;
    averageScore: number;
    genres: Array<string>;
    endDate: FuzzyDateInt;
    trailer: MediaTrailer;
    coverImage: CoverImage;
    rankings: MediaRanking;
    startDate: FuzzyDateInt;
    countryOfOrigin: string;
    externalLinks: MediaExternalLink;
    nextAiringEpisode: AiringSchedule;
}

interface Page {
    media: Array<MediaPageInline>;
}

interface Data {
    Page: Page;
}

export interface QueryPageInline {
    data: Data;
}
