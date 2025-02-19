// src/services/personalDetailsService.js
import axios from "axios";

const STEP = 0;

// Function to fetch personal details data
export const getPersonalDetailsData = async () => {
    try {
        const response = await axios.get(`/api/personalDetails`);
        return response.data;
    } catch (error) {
        console.error("Error fetching personal details data:", error);
        throw error;
    }
};

// Function to save personal details data
export const savePersonalDetailsData = async (data) => {
    try {        
        const response = await axios.post(`/api/personalDetails`, data);
        console.log(response.data);
        
        return response.data;
    } catch (error) {
        console.error("Error saving personal details data:", error);
        throw error;
    }
};