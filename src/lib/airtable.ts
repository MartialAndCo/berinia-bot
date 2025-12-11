
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
    recordId?: string; // Optional Record ID from Airtable
}) {
    if (!base) {
        console.warn("Airtable not configured, skipping save.");
        return data.recordId || "recMOCK" + Date.now();
    }

    try {
        const fields = {
            URL: data.url,
            AgentID: data.agentId,
            LLMID: data.llmId,
            CompanyName: data.companyName,
            SystemPrompt: data.systemPrompt,
            DemoURL: data.demoUrl,
            Status: 'Active'
        };

        if (data.recordId) {
            // Update existing record
            await base(tableName).update([{
                id: data.recordId,
                fields: fields
            }]);
            return data.recordId;
        } else {
            // Create new record
            const records = await base(tableName).create([{ fields }]);
            return records[0].id;
        }

    } catch (error: any) {
        console.error("Airtable Save/Update Error:", error);
        // Throw the real error message to see it in the API response
        throw new Error(`Airtable Error: ${error.message || JSON.stringify(error)}`);
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
    } catch (error: any) {
        console.error("Airtable Update Error:", error);
        // Throw real error here too if this is awaited
        throw new Error(`Airtable Update Error: ${error.message}`);
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
