/**
 * Engagement Tracking System using Intersection Observer and Visibility API.
 * This system tracks how long elements with the attribute 'll_id' are
 * visible in the active browser tab.
 */
import {recordTextEngagement} from "../inspect/store.ts";

// --- DUMMY TRACKING FUNCTIONS & STATE (Replace with your actual logic) ---

// Map to hold the start time for currently active (visible & focused) engagements
const activeEngagements = new Map<string, number>();

/**
 * Starts engagement tracking for a given node ID.
 * In a real app, this would record the start time and the ID.
 * @param id The unique identifier from the 'll_id' attribute.
 */
function startEngagement(id: string): void {
    if (!activeEngagements.has(id)) {
        activeEngagements.set(id, Date.now());
        console.log(`[ENGAGE] STARTED tracking: ${id}`);
    }
}

/**
 * Ends engagement tracking for a given node ID.
 * In a real app, this would calculate the duration (Date.now() - start time)
 * and save it to your Firestore/database.
 * @param id The unique identifier from the 'll_id' attribute.
 */
function endEngagement(id: string): void {
    const startTime = activeEngagements.get(id);
    if (startTime) {
        const durationMs = Date.now() - startTime;
        console.log(`[ENGAGE] ENDED tracking: ${id}. Duration: ${durationMs / 1000} seconds.`);
        activeEngagements.delete(id);

        recordTextEngagement(id, durationMs)
    }
}

// --- CORE INTERSECTION & VISIBILITY LOGIC ---

// Set to hold the IDs of elements currently intersecting the viewport (regardless of tab focus)
const intersectingIds = new Set<string>();

/**
 * Handles changes in element visibility detected by the Intersection Observer.
 * @param entries List of elements whose intersection status has changed.
 */
function handleIntersection(entries: IntersectionObserverEntry[]): void {
    const isTabActive = document.visibilityState === 'visible';

    for (const entry of entries) {
        const targetElement = entry.target as HTMLElement;
        const id = targetElement.getAttribute('ll_id');

        if (!id) continue;

        if (entry.isIntersecting) {
            intersectingIds.add(id);
            // Start engagement ONLY if the tab is also active
            if (isTabActive) {
                startEngagement(id);
            }
        } else {
            intersectingIds.delete(id);
            // End engagement regardless of tab state, as the element is no longer visible
            endEngagement(id);
        }
    }
}

/**
 * Handles the browser tab being brought into focus or hidden.
 * This is crucial for accurate engagement time tracking.
 */
function handleVisibilityChange(): void {
    const isTabActive = document.visibilityState === 'visible';

    if (isTabActive) {
        console.log("[VISIBILITY] Tab is now active. Restarting engagements for visible nodes.");
        // When becoming visible, start tracking all elements that are currently intersecting
        intersectingIds.forEach(id => startEngagement(id));
    } else {
        console.log("[VISIBILITY] Tab is now hidden. Pausing all active engagements.");
        // When becoming hidden, end all current engagements
        activeEngagements.forEach((_, id) => endEngagement(id));
    }
}

/**
 * Initializes the entire engagement tracking system.
 */
export function initEngagementTracking(): void {
    console.log("Initializing Engagement Tracking...");

    // 1. Setup Intersection Observer
    const observerOptions = {
        // Root: null means the viewport
        root: null,
        // Threshold 0.5 means the element is considered visible when 50% of it is in view
        threshold: 0.5,
    };

    const engagementObserver = new IntersectionObserver(handleIntersection, observerOptions);

    // 2. Find and observe all elements with the 'll_id' attribute
    document.querySelectorAll('[ll_id]').forEach(element => {
        engagementObserver.observe(element);
    });

    // 3. Setup Visibility Listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    console.log(`Tracking ${document.querySelectorAll('[ll_id]').length} nodes.`);

    // Note: If the tab is visible on load, the observer will fire immediately for
    // elements already in view, and handleIntersection will call startEngagement().
}

// --- Example Usage (If running in a browser environment) ---
// Since this is a utility file, you'd typically call initEngagementTracking()
// after your DOM is ready. For demonstration purposes, here is a mock setup.

/*
// Mock DOM structure for testing:
const mockElement1 = document.createElement('div');
mockElement1.setAttribute('ll_id', 'para-1');
mockElement1.style.height = '100px';
mockElement1.style.backgroundColor = 'lightblue';
mockElement1.textContent = 'Node 1: Top of the page.';

const mockElement2 = document.createElement('div');
mockElement2.setAttribute('ll_id', 'para-2');
mockElement2.style.height = '2000px'; // Forces scrolling
mockElement2.style.backgroundColor = 'lightgreen';
mockElement2.textContent = 'Node 2: Far down the page.';

document.body.appendChild(mockElement1);
document.body.appendChild(mockElement2);

window.addEventListener('load', initEngagementTracking);
*/
