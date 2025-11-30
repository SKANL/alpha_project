export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const response = await fetch(endpoint, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = "Unknown error";
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || response.statusText;
        } catch (e) {
            errorMessage = response.statusText;
        }
        throw new ApiError(response.status, errorMessage);
    }

    return response.json();
}
