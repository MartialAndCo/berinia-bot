import Airtable from 'airtable';

const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_TABLE_NAME || 'Previews';
const apiKey = process.env.AIRTABLE_API_KEY;

// Initialize Airtable only if keys are present
const base = (apiKey && baseId)
    ? new Airtable({ apiKey }).base(baseId)
    : null;

export async function saveProject(data: {
    url: string;
    agentId: string;
    llmId?: string; // Made optional as we might not have it for fixed agents, or it's fixed
    companyName: string;
    knowledgeBaseSummary: string;
    demoUrl: string;
    recordId?: string;
}) {
    if (!base) {
        console.warn("Airtable not configured, skipping save.");
        return data.recordId || "recMOCK" + Date.now();
    }

    try {
        const fields: any = {
            URL: data.url,
            // AgentID: data.agentId, // Removed as column deleted
            // LLMID: data.llmId, // Optional, might not be needed for fixed agents
            KnowledgeBaseSummary: data.knowledgeBaseSummary,
            DemoURL: data.demoUrl,
            Status: 'Active'
        };

        if (data.llmId) {
            fields.LLMID = data.llmId;
        }

        if (data.recordId) {
            fields.Prospect = [data.recordId];
        }

        const records = await base(tableName).create([{ fields }]);
        return records[0].id;

    } catch (error: any) {
        console.error("Airtable Save Error:", error);
        throw new Error(`Airtable Error: ${error.message || JSON.stringify(error)} `);
    }
}

export async function updateProject(id: string, data: { demoUrl?: string, status?: string }) {
    if (!base) return;

    try {
        await base(tableName).update([
            {
                id: id,
                fields: {
                    ...(data.demoUrl && { DemoURL: data.demoUrl }),
                    ...(data.status && { Status: data.status })
                }
            }
        ]);
    } catch (error: any) {
        console.error("Airtable Update Error:", error);
        // Throw real error here too if this is awaited
        throw new Error(`Airtable Update Error: ${error.message} `);
    }
}

import { ProjectData } from './types';

export async function getProject(id: string): Promise<ProjectData | null> {
    if (!base) {
        // Mock return for dev without Airtable
        return {
            URL: "https://example.com",
            AgentID: "oBeDLoLOeuAbiuaMFXRtDOLriTJ5tSxD", // Example Retell Agent ID
            CompanyName: "Example Corp",
            KnowledgeBaseSummary: "Summary of business info...",
        };
    }

    try {
        const record = await base(tableName).find(id);
        return {
            URL: record.get('URL') as string,
            // AgentID: record.get('AgentID') as string,
            CompanyName: record.get('CompanyName') as string,
            KnowledgeBaseSummary: record.get('KnowledgeBaseSummary') as string,
            Status: record.get('Status') as string,
        };
    } catch (error) {
        console.error("Airtable Fetch Error:", error);
        return null;
    }
}

import { ScrapingMission } from './types';

const configTableId = process.env.AIRTABLE_CONFIG_TABLE_ID || 'tblConfig'; // Use ID or Name if ID not set
const leadsTableId = process.env.AIRTABLE_LEADS_TABLE_ID || 'tblLeads'; // Use ID or Name

// ... (existing exports)

import { Lead } from './types';

export async function createLead(lead: Lead): Promise<string | null> {
    if (!base) {
        console.warn("Airtable not configured, skipping lead save.");
        return "mock-" + Date.now();
    }

    try {
        const records = await base(leadsTableId).create([
            {
                fields: {
                    "First Name": lead.firstName,
                    "Last Name": lead.lastName,
                    "Company": lead.companyName,
                    "Website": lead.website,
                    "Email": lead.email,
                    "Phone": lead.phone,
                    "Address": lead.address,
                    "LinkedIn": lead.linkedIn,
                    "Source": lead.source,
                    "Status": lead.status,
                    "Notes": lead.notes
                }
            }
        ]);
        return records[0].id;
    } catch (error) {
        console.error("Error creating lead:", error);
        throw error;
    }
}


export async function getActiveScrapingMissions(): Promise<ScrapingMission[]> {
    if (!base) return [];

    try {
        const records = await base(configTableId).select({
            filterByFormula: "{Status} = 'Active'"
        }).all();

        return records.map(record => ({
            id: record.id,
            keyword: record.get('Keyword') as string,
            location: record.get('Location') as string,
            maxLeads: (record.get('Max Leads') as number) || 20,
            status: record.get('Status') as 'Active',
            lastRun: record.get('LastRun') as string,
        }));
    } catch (error) {
        console.error("Error fetching active missions:", error);
        return [];
    }
}

export async function getAllScrapingMissions(): Promise<ScrapingMission[]> {
    if (!base) return [];

    try {
        const records = await base(configTableId).select({
            sort: [{ field: "Status", direction: "asc" }]
        }).all();

        return records.map(record => ({
            id: record.id,
            keyword: record.get('Keyword') as string,
            location: record.get('Location') as string,
            maxLeads: (record.get('Max Leads') as number) || 20,
            status: record.get('Status') as 'Active' | 'Inactive',
            lastRun: record.get('LastRun') as string,
        }));
    } catch (error) {
        console.error("Error fetching missions:", error);
        return [];
    }
}

export async function createScrapingMission(data: { keyword: string; location: string; maxLeads: number }): Promise<ScrapingMission | null> {
    if (!base) return null;

    try {
        const records = await base(configTableId).create([
            {
                fields: {
                    "Keyword": data.keyword,
                    "Location": data.location,
                    "Status": "Active",
                    "Max Leads": data.maxLeads // Column is "Number" in Airtable.

                }
            }
        ]);
        const record = records[0];
        return {
            id: record.id,
            keyword: record.get('Keyword') as string,
            location: record.get('Location') as string,
            maxLeads: (record.get('Max Leads') as number) || 20,
            status: record.get('Status') as 'Active' | 'Inactive',
            lastRun: record.get('LastRun') as string,
        };
    } catch (error) {
        console.error("Error creating mission:", error);
        throw error;
    }
}

export async function updateScrapingMissionStatus(id: string, status: 'Active' | 'Inactive'): Promise<void> {
    if (!base) return;
    try {
        await base(configTableId).update([
            {
                id: id,
                fields: {
                    "Status": status
                }
            }
        ]);
    } catch (error) {
        console.error("Error updating mission status:", error);
        throw error;
    }
}

export async function deleteScrapingMission(id: string): Promise<void> {
    if (!base) return;
    try {
        await base(configTableId).destroy([id]);
    } catch (error) {
        console.error("Error deleting mission:", error);
        throw error;
    }
}

export async function getAllProjects(): Promise<any[]> {
    if (!base) return [];

    try {
        const records = await base(tableName).select().all();

        // Sort by creation time (descending) in JS since API sort failed
        const sortedRecords = [...records].sort((a: any, b: any) => {
            return new Date(b._rawJson.createdTime).getTime() - new Date(a._rawJson.createdTime).getTime();
        });

        return sortedRecords.map(record => ({
            id: record.id,
            url: record.get('URL') as string,
            companyName: record.get('CompanyName') as string,
            // agentId: record.get('AgentID') as string,
            summary: record.get('KnowledgeBaseSummary') as string,
            demoUrl: record.get('DemoURL') as string,
            status: record.get('Status') as string,
            createdTime: record._rawJson.createdTime
        }));
    } catch (error) {
        console.error("Error fetching all projects:", error);
        // Fallback for dev/mock
        if (!process.env.AIRTABLE_API_KEY) {
            return [
                { id: 'mock1', url: 'https://example.com', companyName: 'Example Corp', agentId: 'fixed_agent_1', summary: 'Mock Summary', demoUrl: '/preview/mock1', createdTime: new Date().toISOString() }
            ];
        }
        return [];
    }
}
