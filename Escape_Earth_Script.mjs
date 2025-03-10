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
        console.log("\nFetching Sun Data...");
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
            saveSkeletonKey(result.skeletonKey)
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
        console.log("\nFetching planetary data...");
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
            throw new Error("No suitable planet found");
        }

        // Submit the closest planet found
        console.log(`Earth Axial Tilt: ${earthAxialTilt}°`);
        console.log(`Closest Planet: ${closestPlanet.id} with Axial Tilt: ${closestPlanet.axialTilt}°`);

        const result = await submitAnswer(closestPlanet.id);
        console.log("Response from RIS: ", result);
        
        // If a new challenge presented, proceed to the next step 
        if (result.nextChallenge) {
            await solveShortestDayChallenge();
        }

        //If a skeleton key is received, save it
        if (result.skeletonKey) {
            saveSkeletonKey(result.skeletonKey)
        }

    } catch (error) {
        console.error("Error solving Axial Tilt challenge:", error);
    }
}

/**
 * Solves the shortest day challenge by finding the planet with shortest rotation period
 */
async function solveShortestDayChallenge() {
    try {
        console.log("\nFinding planet with shortest day...");
        const response = await fetch(`${SOLAR_SYSTEM_API}/bodies`);
        const planetsData = await response.json();

        // Find the planet with the shortest day (shortest rotation period)
        let shortestDayPlanet = null;
        let shortestRotationPeriod = Infinity;

        // sideralRotation represent the length of a planet's day in hours
        for (const body of planetsData.bodies) {
            if (body.isPlanet && body.sideralRotation !== undefined && body.sideralRotation > 0) {
                if (body.sideralRotation < shortestRotationPeriod) {
                    shortestRotationPeriod = body.sideralRotation;
                    shortestDayPlanet = body;
                }
            }
        } 

        if (!shortestDayPlanet) throw new Error("No suitable planet found");

        console.log(`Planet with shortest day: ${shortestDayPlanet.id} with Rotation Period: ${shortestDayPlanet.sideralRotation} hours`);

        // Submit the answer
        const result = await submitAnswer(shortestDayPlanet.id);
        console.log("Response from RIS:", result);

        // If a new challenge presented, proceed to the next step
        if (result.nextChallenge) {
            await solveJupiterMoonsChallenge();
        }

        //If a skeleton key is received, save it
        if (result.skeletonKey) {
            saveSkeletonKey(result.skeletonKey)
        }

    } catch (error) {
        console.error("Error solving Shortest Day Challenge:", error);
    }
}

/**
 * Solves the challenge by finding the number of moons around Jupiter
 */

async function solveJupiterMoonsChallenge() {
    try {
        console.log("\nFetching Jupiter's moon data...");
        const response = await fetch(`${SOLAR_SYSTEM_API}/bodies/jupiter`);
        const jupiterData = await response.json();

        // Extract the number of moons Jupiter has
        const numberOfMoons = jupiterData.moons ? jupiterData.moons.length : 0;

        console.log(`Jupiter has ${numberOfMoons} moons`);

        // Submit the answer
        const result = await submitAnswer(numberOfMoons);
        console.log("Response from RIS:", result);

        if (result.nextChallenge) {
            await solveLargestJupiterMoonChallenge();
        }

        //If a skeleton key is received, save it
        if (result.skeletonKey) {
            saveSkeletonKey(result.skeletonKey)
        }

    } catch (error) {
        console.error("Error solving Jupiter Moons Challenge", error);
    }
}

/**
 * Solves the challenge by finding the largest moon of Jupiter
 */

async function solveLargestJupiterMoonChallenge() {
    try {
        console.log("\nFetching Jupiter's Moon data...");
        const response = await fetch(`${SOLAR_SYSTEM_API}/bodies/jupiter`);
        if(!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const jupiterData = await response.json();
        

        // Largest known moon of Jupiter is Ganymede
        const largestMoonId = "ganymede";
        const moonResponse = await fetch(`${SOLAR_SYSTEM_API}/bodies/${largestMoonId}`);
        if (!moonResponse.ok) throw new Error("Failed to fetch Ganymede data");
        const moonData = await moonResponse.json();

        console.log(`🌕 Largest moon of Jupiter: ${moonData.englishName} (ID: ${moonData.id}) with Radius: ${moonData.meanRadius} km`);

        // Submit the answer
        const result = await submitAnswer(moonData.id);
        console.log("📜 Response from RIS:", result);

        if (result.nextChallenge) {
            await solvePlutoClassificationChallenge();
        }

        //If a skeleton key is received, save it
        if (result.skeletonKey) {
            saveSkeletonKey(result.skeletonKey)
        }

    } catch (error) {
        console.error("Error solving Largest Jupiter Moon challenge:", error)
    }
}

/**
 * Solves the challenge by finding Pluto's classification
 */

async function solvePlutoClassificationChallenge() {
    try {
        console.log("\n Fetching Pluto's classification...");
        const response = await fetch(`${SOLAR_SYSTEM_API}/bodies/pluto`);
        const plutoData = await response.json();

        // Extract Pluto's classification
        const classification = plutoData.bodyType;

        console.log(`Pluto Classification: ${classification}`);

        // Submit the answer
        const result = await submitAnswer(classification);
        console.log("Response from RIS:", result);

        if (result.sceletonKey) {
            await saveSkeletonKey();
        }
    } catch (error) {
        console.error("Error solving Pluto Classification Challenge: ", error)
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

function saveSkeletonKey(key) {
    fs.writeFileSync("skeleton.txt", key, "utf8");
    console.log("Skeleton key Saved");
}

startChallenge().catch(console.error);