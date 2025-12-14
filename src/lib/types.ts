
export interface ProjectData {
    URL: string;
    AgentID?: string; // Made optional/deprecated
    CompanyName: string;
    KnowledgeBaseSummary: string;
    Status?: string; // e.g. 'Active', 'Inactive'
}

export interface ScrapingMission {
    id: string;
    keyword: string;
    location: string;
    maxLeads: number;
    status: 'Active' | 'Inactive';
    lastRun?: string;
}

export interface Lead {
    firstName?: string;
    lastName?: string;
    companyName: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedIn?: string;
    source: string; // e.g. "Google Maps", "LinkedIn"
    status: 'New' | 'Contacted' | 'Qualified' | 'Closed';
    notes?: string;
}
