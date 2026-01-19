export interface FileItem {
    file_id: string;
    number_of_pages: number;
    file_name: string;
    user_id: string;
    id: string;
    created_at: string;
}

export type SortOrder = "newest" | "oldest";
