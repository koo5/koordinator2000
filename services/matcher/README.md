# Participation Matcher Service

## Overview
The Participation Matcher service monitors campaigns and their participation thresholds, sending notifications when campaigns reach or fall below user-defined critical mass thresholds.

## How It Works

### Core Algorithm
The matcher continuously polls the database for campaigns and their participation records, then:

1. For each campaign, counts the total number of participants
2. Evaluates each participation record's threshold against the current count
3. Updates the fulfillment status of thresholds that have changed
4. Sends notifications to users when their thresholds are reached or no longer met

### Notification Types
- **Threshold Reached**: "Heads up! [campaign title] just reached your defined critical mass of [threshold]! Start acting now!"
- **Threshold Lost**: "Heads up! [campaign title] just un-reached your defined critical mass of [threshold]! Go back home now, it's pointless!"

### Process Flow
1. Fetches all campaigns with their participation records (ordered by threshold)
2. For each campaign:
   - Determines which participation thresholds are fulfilled based on participant count
   - Identifies participation records that need status updates
   - Updates status flags and sends appropriate notifications

## Technical Details

### Dependencies
- GraphQL with Apollo Client for database operations
- Node.js runtime environment
- Moment.js for timestamp handling

### Execution Model
- Runs as a continuous loop with configurable intervals
- Self-healing with error handling and automatic retries
- Processes one threshold change at a time to ensure consistency

### Data Structure
The matcher works with:
- **Campaigns**: Containing ID, title, and other metadata
- **Participation Records**: User thresholds and fulfillment status
- **Notifications**: System-generated messages about threshold events

## Usage
Run the service with `npm start` or in development mode with `npm run dev`.