import fetch from 'node-fetch';
import fs from 'fs';
import { error } from 'console';

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
        console.log("Fetching Sun Data...");
        const response = await fetch(`${SOLAR_SYSTEM_API}/bodies/soleil`);
        const sunData = await response.json();

        // Extract equatorial radius and mean radius
        const equatorialRadius = sunData.equaRadius;
        const meanRadius = sunData.meanRadius;

        // Compute the access PIN by subtracting the mean radius from the equatorial radius
        const accessPin = equatorialRadius - meanRadius;

        console.log(`Equatorial Radius: ${equatorialRadius} km`);
        console.log(`Mean Radius: ${meanRadius} km`);
        console.log(`Calculated Access Pin: ${accessPin}`);

        //Submitting the computed answer
        const result = await submitAnswer(accessPin);
        console.log("Response from RIS:", result);

        //If a new challenge is presented, proceed to the next step
        if (result.nextChallenge) {
            await solveAxialTiltChallenge();
        }

        //If a skeleton key is received, save it
        if (result.skeletonKey) {
            
        }
    } catch (error) {
        console.error(" Error solving sun radius challenge: ", error);
    }
}

/**
 * Solves the axial tilt challenge by finding the planet with the closest axial tilt to Earth.
 */

async function solveAxialTiltChallenge() {
    try {
        console.log("Fetching planetary data...");
        const response = await fetch(`${SOLAR_SYSTEM_API}/bodies`);
        const planetsData = await response.json();

        // Find Earth's axial tilt
        const earthData = planetsData.bodies.find(body => body.id === "terre");
        if (!earthData) throw new error("Earth data not found");
        const earthAxialTilt = earthData.axialTilt;

        let closestPlanet = null;
        let smallestDifference = Infinity;

        // Iterate over all planets to find the closest axial tilt to Earth
        for (const body of planetsData.bodies) {
            if (body.axialTilt !== undefined && body.id !== "terre") {
                const diff = Math.abs(body.axialTilt - earthAxialTilt);
                if (diff < smallestDifference) {
                    smallestDifference = diff;
                    closestPlanet = body
                }
            }
        }

        if (!closestPlanet) {
            throw new error("No suitable planet found");
        }

        // Submit the closest planet found
        console.log(`Earth Axial Tilt: ${earthAxialTilt}°`);
        console.log(`Closest Planet: ${closestPlanet.id} with Axial Tilt: ${closestPlanet.axialTilt}°`);

        const result = await submitAnswer(closestPlanet.id);
        console.log("Response from RIS: ", result);
    } catch (error) {
        console.error("Error solving Axial Tilt challenge:", error);
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

startChallenge().catch(console.error);