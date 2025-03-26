# Setting Up Google Cloud Services for Hackalyze

This guide will help you set up Google Cloud services for enhanced text extraction from multimedia files in Hackalyze.

## Google Cloud Services Integration

We've integrated the following Google Cloud services to enhance the Hackalyze platform:

1. **Google Cloud Vision API** - For extracting text from images with advanced OCR
2. **Google Cloud Speech-to-Text** - For transcribing audio files with multilingual support
3. **Google Cloud Video Intelligence** - For extracting both visible text and speech from videos

These services work alongside your existing Gemini 1.5 Flash API integration for hackathon submission evaluation, creating a more powerful and consistent user experience.

## Setup Instructions

### 1. Create or Use an Existing Google Cloud Project

If you already have a Google Cloud project configured for Gemini API, you can use the same project.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project or create a new one

### 2. Enable the Required APIs

For each service, you need to enable the corresponding API:

1. Navigate to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Cloud Vision API
   - Cloud Speech-to-Text API
   - Video Intelligence API

### 3. Create a Service Account and Download Credentials

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a name (e.g., "hackalyze-media-processor")
4. Assign the following roles:
   - Cloud Vision API User
   - Cloud Speech-to-Text User
   - Video Intelligence API User
5. Complete the service account creation
6. Click on the service account, go to the "Keys" tab
7. Click "Add Key" > "Create new key" > JSON
8. Save the JSON file securely

### 4. Configure Environment Variables

1. Place the downloaded JSON credentials file in a secure location
2. Update your `.env` file with the path to the credentials:

```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-credentials.json
```

## Usage Notes

### Cost Management

Google Cloud services are billed based on usage. To manage costs:

1. Set up billing alerts in Google Cloud Console
2. Consider implementing quotas for API requests
3. Monitor usage regularly through Google Cloud Console

### Performance Considerations

- For large files, processing might take longer
- Video analysis is particularly resource-intensive and may take several minutes
- Consider implementing caching for repeated access to the same content

## Integration with Ideation Judge

The extracted text from files will be stored in the submission's description field, making it available to the Gemini 1.5 Flash API for ideation judging. This creates a seamless workflow:

1. Students upload files (images, audio, video, documents)
2. The system automatically extracts text content using Google Cloud services
3. The extracted text is stored with the submission
4. The Gemini API evaluates the content against hackathon criteria
5. Teachers can view both the original file and extracted text on the redesigned TeacherHackathonPage

## Troubleshooting

If you encounter issues:

1. Check that the credential JSON file is accessible and properly formatted
2. Verify that the required APIs are enabled in your Google Cloud project
3. Ensure billing is enabled for your Google Cloud project
4. Check the logs for specific error messages
