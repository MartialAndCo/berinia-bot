
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
    llmId: string;
    companyName: string;
    systemPrompt: string;
    demoUrl: string;
}) {
    if (!base) {
        console.warn("Airtable not configured, skipping save.");
        // Return a mock ID so the app doesn't crash in dev
        return "recMOCK" + Date.now();
    }

    try {
        const records = await base(tableName).create([
            {
                fields: {
                    URL: data.url,
                    AgentID: data.agentId,
                    LLMID: data.llmId,
                    CompanyName: data.companyName,
                    SystemPrompt: data.systemPrompt,
                    DemoURL: data.demoUrl,
                    Status: 'Active'
                }
            }
        ]);
        return records[0].id;
    } catch (error) {
        console.error("Airtable Save Error:", error);
        throw new Error("Failed to save to Airtable");
    }
}

export async function updateProject(id: string, data: { demoUrl?: string }) {
    if (!base) return;

    try {
        await base(tableName).update([
            {
                id: id,
                fields: {
                    ...(data.demoUrl && { DemoURL: data.demoUrl })
                }
            }
        ]);
    } catch (error) {
        console.error("Airtable Update Error:", error);
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
            SystemPrompt: "You are a helpful assistant.",
        };
    }

    try {
        const record = await base(tableName).find(id);
        return {
            URL: record.get('URL') as string,
            AgentID: record.get('AgentID') as string,
            CompanyName: record.get('CompanyName') as string,
            SystemPrompt: record.get('SystemPrompt') as string,
        };
    } catch (error) {
        console.error("Airtable Fetch Error:", error);
        return null;
    }
}
