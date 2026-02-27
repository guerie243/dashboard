export interface UserAction {
    _id: string;
    eventType: string;
    userId?: string;
    userName?: string;
    ipAddress?: string;
    screenName?: string;
    vitrineSlug?: string;
    vitrineName?: string;
    timestamp?: string;
    createdAt?: string;
    sessionId?: string;
    deviceInfo?: {
        platform: string;
        osVersion: string;
        appVersion: string;
        deviceModel: string;
    };
    metadata?: Record<string, any>;
    description?: string;
}

export interface ActivityApiResponse {
    success: boolean;
    count: number;
    limit: number;
    skip: number;
    data: UserAction[];
}
