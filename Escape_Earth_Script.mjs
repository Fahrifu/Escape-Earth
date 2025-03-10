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
        const response = await fetch(`${RIS_URL}/start?player=${PLAYER}`);
        const data = await response.json();
        console.log("Data Received:", data);

        const challenge = data.challenge;

        // Check what type of challenge we have received and solve accordingly
        if (challenge.includes("equatorial radius")) {
            await solveSunRadiusChallenge();
        }
    } catch (error) {
        console.error("Error starting mission:", error);
    }
}

/**
 * Solves the challenge related to the Sun's radius by finding the PIN
 */
async function solveSunRadiusChallenge() {
    try {
        console.log("Fetching data...") 
        const response = await fetch(`${SOLAR_SYSTEM_API}/bodies/soleil`);
        const sunData = await response.json();

        // Extract equatorial radius and mean radius
        const equatorialRadius = sunData.equaRadius;
        const meanRadius = sunData.meanRadius;

        // Compute the access PIN by subtracting the mean radius from the equatorial radius
        const accessPin = equatorialRadius - meanRadius;

        console.log(`Equatorial Radius: ${equatorialRadius} km`);
        console.log(`Mean Radius: ${meanRadius} km`);
        console.log(`Calcualted Access Pin: ${accessPin}`);

        //Submitting the computed answer
        const result = await submitAnswer(accessPin);
        console.log("Response from RIS:", result);

        //If a new challenge is presented, proceed to the next step
        if (result.nextChallenge) {

        }

        //If a skeleton key is received, save it
        if (result.skeletonKey) {
            
        }
    } catch (error) {
        console.error(" Error solving sun radius challenge: ", error);
    }
}

/**
 * Submits an answer to the RIS system
 * @param {string|number} answer - The computed answer to submit  
 */
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

