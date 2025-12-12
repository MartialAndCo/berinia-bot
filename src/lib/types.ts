
export interface ProjectData {
    URL: string;
    AgentID: string;
    CompanyName: string;
    SystemPrompt: string;
}

export interface ScrapingMission {
    id: string;
    keyword: string;
    location: string;
    maxLeads: number;
    status: 'Active' | 'Inactive';
    lastRun?: string;
}
