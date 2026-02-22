import axios from "axios";
import { API_ENDPOINTS } from "@/app/lib/constants";
import type { FileItem } from "@/app/types";

// File API
export const fileApi = {
    getFiles: async (): Promise<FileItem[]> => {
        const response = await axios.get(API_ENDPOINTS.FILES);
        return response.data;
    },

    uploadFiles: async (files: File[]): Promise<void> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        await axios.post(API_ENDPOINTS.UPLOAD, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

// Chat API
export interface ChatPayload {
    message: string;
    knowledge_files: string[];
}

export const chatApi = {
    sendMessage: async (payload: ChatPayload) => {
        const response = await axios.post(API_ENDPOINTS.CHAT, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    },
};


export const researchApi = {
    getResearchPlan: async (payload: ChatPayload) => {
        const response = await axios.post(API_ENDPOINTS.RESEARCH_PLAN, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    },
    getResearchExecute: async (payload: ChatPayload) => {
        const response = await axios.post(API_ENDPOINTS.RESEARCH_EXECUTE, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    },
};