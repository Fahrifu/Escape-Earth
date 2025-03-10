import fetch from 'node-fetch';
import fs from 'fs';

// Email for authentication
const PLAYER = "hlmnguyen@uia.no";

const RIS_URL = "https://spacescavanger.onrender.com";
const SOLAR_SYSTEM_API = "https://api.le-systeme-solaire.net/rest";

/**
 * Initiates the mission by contacting the RIS system
 * Determines the challenge type of executes the corresponding function
 */

async function startChallenge() {
    try {
        console.log("Connecting to RIS System...");
        const response = await fetch (`${RIS_URL}/start?player=${PLAYER}`);
        const data = await response.json();
        console.log("Data Received:", data);

        const challenge = data.challenge;

        // Check what type of challenge we have received and solve accordingly
        if (challenge.includes("equatorial radius")) {
            
        }
    } catch (error) {
        console.error("Error starting mission:", error);
    }
}

async function submitAnswer(answer) {
    try {
        console.log("Submitting answer...");
        const response = await fetch(`${RIS_URL}/answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer: answer, player: PLAYER})
        });
        return await response.json();
    } catch (error) {
        console.error("Error submit answer:", error);
    }
}