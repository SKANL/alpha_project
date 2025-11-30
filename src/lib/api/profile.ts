import { apiClient } from "./core";

export const ProfileApi = {
    updateProfile: async (formData: FormData) => {
        const response = await fetch("/api/profile/update", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to update profile");
        }

        return response.json();
    },
};
