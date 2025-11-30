import { supabase } from "../lib/supabase";
import type { Profile, UpdateProfileDTO } from "../lib/types";

export class ProfileService {
    /**
     * Get profile by user ID.
     */
    static async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            return null;
        }

        return data as Profile;
    }

    /**
     * Update profile.
     */
    static async updateProfile(userId: string, profileData: UpdateProfileDTO): Promise<Profile> {
        const { data, error } = await supabase
            .from("profiles")
            .update(profileData)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("Error updating profile:", error);
            throw new Error(error.message);
        }

        return data as Profile;
    }
}
