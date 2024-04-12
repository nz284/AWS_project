#!/bin/bash

# Parameters
# ID="1"
# FILE_PATH="amplifyauth7f7dbaf28503456895e12d9cc3047cd6c016d-dev/public/test.txt"
# FILE_NAME="test.txt"
# TEXT="123"
ID=$1
FILE_PATH=$2
FILE_NAME=$3
TEXT=$4

# Extract bucket name and directory from file path
BUCKET_NAME=$(echo "$FILE_PATH" | cut -d'/' -f1)
DIRECTORY=$(dirname "$FILE_PATH")

# Extract filename without extension
FILE_BASENAME="${FILE_NAME%.*}"

# Download file from S3
aws s3 cp "s3://$FILE_PATH" "/tmp/$FILE_NAME"

# Append text to the file
echo "$TEXT" >> "/tmp/$FILE_NAME"

# Construct the new file name
NEW_FILE_NAME="${FILE_BASENAME}_output.${FILE_NAME##*.}"

# Move the file with the appended text and renamed
mv "/tmp/$FILE_NAME" "/tmp/$NEW_FILE_NAME"

# Construct the output path without duplicating the bucket name
OUTPUT_PATH="s3://$DIRECTORY/$NEW_FILE_NAME"
aws s3 cp "/tmp/$NEW_FILE_NAME" "$OUTPUT_PATH" 

# Update DynamoDB with the new output path
aws dynamodb update-item \
    --table-name file_lib \
    --key '{ "id": { "S": "'"$ID"'" } }' \
    --update-expression "SET output_path = :outputPath" \
    --expression-attribute-values '{ ":outputPath": {"S": "'"$OUTPUT_PATH"'" } }'

# Clean up temporary files
rm "/tmp/$NEW_FILE_NAME"
