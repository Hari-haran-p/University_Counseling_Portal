// src/services/educationalDetailsService.js
import axios from "axios";

// Function to fetch educational details data
export const getEducationalDetailsData = async () => {
    try {
        const response = await axios.get(`/api/educationalDetails`);
        return response.data;
    } catch (error) {
        console.error("Error fetching educational details data:", error);
        throw error;
    }
};

// Function to save educational details data
export const saveEducationalDetailsData = async (data) => {
    try {
        const response = await axios.post(`/api/educationalDetails`, data);
        return response.data;
    } catch (error) {
        console.error("Error saving educational details data:", error);
        throw error;
    }
};