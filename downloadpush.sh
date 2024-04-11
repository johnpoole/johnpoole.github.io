#!/bin/bash

# Set the URL of the file you want to download
FILE_URL="https://api.sportsdata.io/golf/v2/json/Leaderboard/575?key=e5c88f4eb3e24d6da0d0bc6694b82a76"

# Set the path where you want to save the file
# This should be relative to the root of your Git repository
FILE_PATH="leaderboard.json"

# Set your Git commit message
COMMIT_MESSAGE="Update file"

# Set the remote and branch you want to push to
REMOTE_NAME="origin"
BRANCH_NAME="master"


GH_USERNAME="jdpoole@gmail.com"
GH_TOKEN="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"
while true; do

    # Download the file
    wget -O "$FILE_PATH" "$FILE_URL"

    # Git commands to add, commit, and push the file
    git add leaderboard.json
    git commit -m "$COMMIT_MESSAGE"
        git -c http.extraHeader="Authorization: basic $(echo -n ${GH_USERNAME}:${GH_TOKEN} | base64)" push "$REMOTE_NAME" "$BRANCH_NAME"


    # Wait for 5 minutes before repeating
    sleep 300
done
