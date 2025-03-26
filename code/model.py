import os
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
from datetime import datetime
import mimetypes
import pathlib
import PyPDF2
import pytesseract
from PIL import Image
import io
import tika
from tika import parser
import requests
import json
import tempfile
from moviepy.editor import VideoFileClip, AudioFileClip
from dotenv import load_dotenv
import time
import traceback
import subprocess

# Load environment variables from .env file if it exists
try:
    load_dotenv()
    print("Environment variables loaded from .env file")
except Exception as e:
    print(f"Note: Could not load .env file. Using system environment variables. ({e})")

# Initialize tika
tika.initVM()

# Sarvam AI API settings
SARVAM_API_KEY = os.environ.get('SARVAM_API_KEY', '')
SARVAM_SPEECH_TO_TEXT_TRANSLATE_URL = "https://api.sarvam.ai/speech-to-text-translate" # This handles both transcription and translation
# The batch API is not directly accessible via REST API and requires using a notebook
SARVAM_BATCH_NOTEBOOK_URL = "https://github.com/sarvamai/sarvam-ai-cookbook/tree/main/notebooks/stt-translate/stt-translate-batch-api"

# Make sure extracts directory exists
EXTRACTS_DIR = "extracts"
BATCH_JOBS_FILE = os.path.join(EXTRACTS_DIR, "batch_jobs.json")
os.makedirs(EXTRACTS_DIR, exist_ok=True)

# Function to detect file type based on extension and mime type
def detect_file_type(file_path):
    """Detect the type of file based on extension and content"""
    # Initialize mimetypes
    mimetypes.init()
    
    # Get file extension and convert to lowercase
    ext = os.path.splitext(file_path)[1].lower()
    mime_type, _ = mimetypes.guess_type(file_path)
    
    # Determine file type based on extension and mime type
    if ext in ['.txt', '.csv', '.md', '.json', '.xml', '.html']:
        return "Text"
    elif ext == '.pdf' or (mime_type and mime_type == 'application/pdf'):
        return "PDF"
    elif ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff']:
        return "Image"
    elif ext in ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a']:
        return "Audio"
    elif ext in ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv']:
        return "Video"
    else:
        # Try to determine based on mime type
        if mime_type:
            if mime_type.startswith('text/'):
                return "Text"
            elif mime_type.startswith('image/'):
                return "Image"
            elif mime_type.startswith('audio/'):
                return "Audio"
            elif mime_type.startswith('video/'):
                return "Video"
        
        # If all else fails, assume it might be a text file
        return "Unknown"

# Text extraction functions for different file types
def extract_text_from_txt(file_path):
    """Extract text from a plain text file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return {"text": f.read(), "method": "UTF-8 Text Parser"}
    except UnicodeDecodeError:
        # Try with different encodings for multilingual support
        for encoding in ['latin-1', 'iso-8859-1', 'utf-16', 'utf-32']:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    return {"text": f.read(), "method": f"{encoding} Text Parser"}
            except UnicodeDecodeError:
                continue
        # If all encodings fail, try binary mode and decode with errors ignored
        with open(file_path, 'rb') as f:
            return {"text": f.read().decode('utf-8', errors='replace'), "method": "Binary/Fallback Text Parser"}

def extract_text_from_pdf(file_path):
    """Extract text from a PDF file using PyPDF2"""
    try:
        text = ""
        with open(file_path, 'rb') as file:
            # Create PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Get number of pages
            num_pages = len(pdf_reader.pages)
            
            # Extract text from each page
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text += f"\n--- Page {page_num + 1} ---\n"
                text += page.extract_text()
                
        if text.strip():
            return {"text": text, "method": "PyPDF2"}
        else:
            return {"text": "No text could be extracted from this PDF. It might be scanned or contain only images.", "method": "PyPDF2 failed"}
            
    except Exception as e:
        return {"text": f"Error extracting text from PDF: {str(e)}", "method": "Error"}

def extract_text_from_image(file_path):
    """Extract text from an image file using pytesseract with Indic language support and Tika as fallback"""
    try:
        # Open the image using PIL
        img = Image.open(file_path)
        
        print("Attempting OCR with pytesseract using Indic language packs...")
        
        # Use pytesseract to extract text with all Indic languages we have installed
        # This includes Bengali, Hindi, Tamil, Telugu, Kannada, Malayalam and English
        text = pytesseract.image_to_string(
            img, 
            lang='eng+ben+hin+tam+tel+kan+mal',
            config='--psm 6'
        )
        
        # If we got text, return it immediately
        if text.strip():
            return {"text": text, "method": "Tesseract OCR (multilingual)"}
            
        # If pytesseract didn't get any text, try with Tika as fallback
        print("Pytesseract returned no text, trying with Apache Tika...")
        try:
            parsed = parser.from_file(file_path)
            if parsed and 'content' in parsed and parsed['content'] and parsed['content'].strip():
                return {"text": parsed['content'].strip(), "method": "Apache Tika (fallback)"}
        except Exception as tika_error:
            print(f"Tika error: {str(tika_error)}. Will try one more method.")
            
        # Last resort: try with English only if neither method worked
        text = pytesseract.image_to_string(img, lang='eng')
        if text.strip():
            return {"text": text, "method": "Tesseract OCR (English only)"}
        else:
            return {"text": "No text could be detected in this image.", "method": "All methods failed"}
    except Exception as e:
        return {"text": f"Error extracting text from image: {str(e)}", "method": "Error"}

def extract_text_from_audio(file_path):
    """Extract text from an audio file using Sarvam AI's speech-to-text API"""
    # Track whether we're using a temporary file that needs cleanup
    using_temp_file = False
    temp_audio_path = None
    
    try:
        if not SARVAM_API_KEY:
            return {"text": "Cannot process audio: Sarvam AI API key not set. Please set SARVAM_API_KEY environment variable.", 
                    "method": "Error: Missing API Key"}
        
        print(f"Processing audio file: {file_path}")
        
        # Prepare the API request
        headers = {
            'api-subscription-key': SARVAM_API_KEY
        }
        
        # Check if we need to convert the file to a supported format
        file_ext = os.path.splitext(file_path)[1].lower()
        
        # List of formats accepted by Sarvam AI API
        supported_formats = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.wave': 'audio/wave',
        }
        
        # If file is not in a supported format, convert it to WAV
        if file_ext not in supported_formats:
            print(f"File format {file_ext} not directly supported by Sarvam AI. Converting to WAV...")
            try:
                # Create a temporary file for the converted audio
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio_file:
                    temp_audio_path = temp_audio_file.name
                
                # Use moviepy to convert audio to WAV
                audio_clip = AudioFileClip(file_path)
                audio_clip.write_audiofile(temp_audio_path, codec='pcm_s16le')
                audio_clip.close()
                
                # Use the converted file instead
                print(f"Converted audio to {temp_audio_path}")
                file_path = temp_audio_path
                content_type = 'audio/wav'
                using_temp_file = True
            except Exception as conv_error:
                # Clean up the temp file if it was created but conversion failed
                if temp_audio_path and os.path.exists(temp_audio_path):
                    try:
                        os.unlink(temp_audio_path)
                    except:
                        pass
                return {"text": f"Error converting audio to supported format: {str(conv_error)}", "method": "Error: Format Conversion"}
        else:
            # Use the format from our mapping
            content_type = supported_formats[file_ext]
        
        # Check audio duration to determine which API to use
        audio_duration = get_audio_duration(file_path)
        print(f"Audio duration: {audio_duration:.2f} seconds")
        
        if audio_duration <= 30:
            # For short audio (<= 30 seconds), use the real-time API
            return process_short_audio(file_path, content_type, headers)
        else:
            # For longer audio (> 30 seconds), use the batch API
            return process_long_audio(file_path, content_type, headers)
        
    except Exception as e:
        error_message = f"Error extracting text from audio: {str(e)}"
        print(error_message)
        return {"text": error_message, "method": "Error"}
    finally:
        # Clean up temporary file if one was created
        if using_temp_file and temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.unlink(temp_audio_path)
                print(f"Cleaned up temporary file: {temp_audio_path}")
            except Exception as cleanup_error:
                print(f"Warning: Failed to delete temporary audio file: {cleanup_error}")

def process_short_audio(file_path, content_type, headers):
    """Process short audio files (<=30 seconds) using the real-time API"""
    # Check if file exists
    if not os.path.exists(file_path):
        return {"text": f"Error: Audio file not found: {file_path}", "method": "Error: File not found"}
    
    # Verify the API key is in headers
    if 'api-subscription-key' not in headers and 'x-sarvam-key' not in headers:
        api_key = os.environ.get("SARVAM_API_KEY")
        if not api_key:
            return {
                "text": "Error: SARVAM_API_KEY is not set. Please check your environment variables.",
                "method": "Error: Missing API key"
            }
        # Add the API key to headers with the correct format
        headers = headers.copy() if headers else {}
        headers['api-subscription-key'] = api_key.strip()
    elif 'x-sarvam-key' in headers and 'api-subscription-key' not in headers:
        # Convert from x-sarvam-key format to api-subscription-key
        headers = headers.copy()
        headers['api-subscription-key'] = headers['x-sarvam-key']
        del headers['x-sarvam-key']
    
    # Use the speech-to-text-translate endpoint which handles both transcription and translation
    try:
        files = {
            'file': (os.path.basename(file_path), open(file_path, 'rb'), content_type)
        }
        
        data = {
            'model': 'saaras:v2',
            'source_language': 'auto-detect',
            'target_language': 'en'
        }
        
        print(f"Using content type: {content_type} and model: saaras:v2")
        print(f"Headers keys: {list(headers.keys())}")
        print("Attempting speech recognition and translation with Sarvam AI real-time API...")
        
        response = requests.post(
            SARVAM_SPEECH_TO_TEXT_TRANSLATE_URL, 
            headers=headers, 
            files=files,
            data=data
        )
        
        # Close the file
        files['file'][1].close()
        
        if response.status_code == 200:
            result = response.json()
            
            # Debug the response structure
            print(f"API Response keys: {list(result.keys())}")
            
            # Extract relevant fields - adapt these based on the actual API response structure
            transcript = result.get('target_text', result.get('transcript', ''))  # English translation
            source_transcript = result.get('source_text', result.get('source_transcript', ''))  # Original language transcription
            source_language = result.get('detected_language', result.get('source_language_code', 'unknown'))
            
            if source_transcript.strip() or transcript.strip():
                combined_text = f"Original ({source_language}):\n{source_transcript}\n\nTranslated (English):\n{transcript}"
                return {"text": combined_text, "method": f"Sarvam AI Speech-to-Text-Translate (from {source_language} to English)"}
            else:
                return {"text": "The API returned successfully, but no transcription was produced. The audio may not contain clear speech.", 
                        "method": "Sarvam AI Speech-to-Text-Translate (No text detected)"}
        
        # If the API call fails
        try:
            error_data = response.json()
            error_message = error_data.get('detail', 
                           error_data.get('error', {}).get('message', 
                           error_data.get('message', 'Unknown error')))
            detailed_error = f"Failed to extract text from audio.\nStatus code: {response.status_code}\nError: {error_message}"
        except:
            detailed_error = f"Failed to extract text from audio.\nStatus code: {response.status_code}\nResponse: {response.text}"
        
        print(detailed_error)
        return {"text": detailed_error, "method": f"Error: Sarvam AI API ({response.status_code})"}
    
    except requests.exceptions.RequestException as e:
        error_msg = f"Network error when connecting to Sarvam AI API: {str(e)}"
        print(error_msg)
        return {"text": error_msg, "method": "Error: Network"}
    
    except Exception as e:
        error_msg = f"Unexpected error processing audio: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return {"text": error_msg, "method": "Error: Processing"}

def process_long_audio(file_path, content_type, headers):
    """Process longer audio files (>30 seconds) by splitting into 30-second chunks"""
    print("Audio is longer than 30 seconds. Processing in smaller segments...")
    
    try:
        # First, verify that the file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        
        # Use direct methods to get duration
        audio_clip = AudioFileClip(file_path)
        total_duration = audio_clip.duration
        audio_clip.close()
        
        # Calculate the number of segments we'll need to process
        segment_length = 30.0  # 30 seconds per segment
        num_segments = int(total_duration / segment_length) + (1 if total_duration % segment_length > 0 else 0)
        
        print(f"Total audio duration: {total_duration:.2f} seconds")
        print(f"Processing in {num_segments} segments of approximately {segment_length} seconds each")
        
        segment_results = []
        
        # Process each segment separately using the original file
        for i in range(num_segments):
            start_time = i * segment_length
            end_time = min((i + 1) * segment_length, total_duration)
            
            print(f"Processing segment {i+1}/{num_segments} ({start_time:.2f}s to {end_time:.2f}s)...")
            
            # For each segment, we'll extract a new file with just that segment
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as segment_file:
                segment_path = segment_file.name
            
            try:
                # Create a subclip for this segment
                segment_audio = AudioFileClip(file_path).subclip(start_time, end_time)
                # Write the segment to a file
                segment_audio.write_audiofile(
                    segment_path, 
                    codec='pcm_s16le', 
                    fps=16000,  # Use a standard sample rate for speech
                    nbytes=2,   # 16-bit audio
                    verbose=False, 
                    logger=None,
                    ffmpeg_params=["-ac", "1"]  # Force mono channel
                )
                segment_audio.close()
                
                # Verify the segment file exists and has content
                if not os.path.exists(segment_path) or os.path.getsize(segment_path) == 0:
                    print(f"Warning: Failed to create valid segment {i+1}. Skipping.")
                    continue
                
                # Process this segment with the real-time API
                print(f"Sending segment {i+1}/{num_segments} to Sarvam AI API...")
                
                # Use segment path directly with the API
                segment_result = process_short_audio(segment_path, "audio/wav", headers)
                
                # Store the result
                segment_results.append({
                    "segment": i+1,
                    "start_time": start_time,
                    "end_time": end_time,
                    "text": segment_result["text"],
                    "method": segment_result["method"]
                })
                
                # Add a brief pause to avoid rate limiting
                time.sleep(1)
                
            except Exception as e:
                print(f"Error processing segment {i+1}: {e}")
                import traceback
                traceback.print_exc()
            finally:
                # Clean up the temporary segment file
                try:
                    if os.path.exists(segment_path):
                        os.unlink(segment_path)
                except Exception as cleanup_error:
                    print(f"Warning: Failed to delete temporary segment file: {cleanup_error}")
        
        # If we didn't get any results, return an error
        if not segment_results:
            return {"text": "Failed to process any segments of the audio file.", "method": "Error: Segmented Audio Processing"}
        
        # Combine all segment results
        combined_text = f"Long Audio Processing Results (Processed in {num_segments} segments)\n"
        combined_text += f"Total Duration: {total_duration:.2f} seconds\n"
        combined_text += "-" * 80 + "\n\n"
        
        # Extract language information from the first successful segment
        source_language = "unknown"
        for result in segment_results:
            if "from" in result["method"]:
                # Extract language code from method string like "Sarvam AI Speech-to-Text-Translate (from hi-IN to English)"
                method_parts = result["method"].split("from ")
                if len(method_parts) > 1:
                    language_part = method_parts[1].split(" to")[0]
                    source_language = language_part
                    break
        
        # Combine all transcripts
        original_transcripts = []
        english_transcripts = []
        
        for i, result in enumerate(segment_results):
            segment_num = i + 1
            start_time = result["start_time"]
            end_time = result["end_time"]
            segment_text = result["text"]
            
            combined_text += f"SEGMENT {segment_num} ({start_time:.2f}s - {end_time:.2f}s):\n"
            combined_text += "-" * 40 + "\n"
            combined_text += segment_text + "\n\n"
            
            # Try to extract original and translated text for later combination
            if "Original" in segment_text and "Translated" in segment_text:
                parts = segment_text.split("\n\n")
                if len(parts) >= 2:
                    original_part = parts[0].replace(f"Original ({source_language}):", "").strip()
                    translated_part = parts[1].replace("Translated (English):", "").strip()
                    
                    original_transcripts.append(original_part)
                    english_transcripts.append(translated_part)
        
        # Add combined transcript at the end if we have both original and translations
        if original_transcripts and english_transcripts:
            combined_text += "\n" + "=" * 80 + "\n"
            combined_text += "COMBINED TRANSCRIPT\n"
            combined_text += "=" * 80 + "\n\n"
            
            combined_text += f"Original ({source_language}):\n"
            combined_text += " ".join(original_transcripts) + "\n\n"
            
            combined_text += "Translated (English):\n"
            combined_text += " ".join(english_transcripts)
        
        return {"text": combined_text, "method": f"Segmented Audio Processing ({num_segments} segments, from {source_language} to English)"}
    
    except Exception as e:
        error_message = f"Error processing long audio file: {str(e)}"
        print(error_message)
        traceback_info = traceback.format_exc()
        print(traceback_info)
        return {"text": error_message, "method": "Error: Long Audio Processing"}

def extract_text_from_video(file_path):
    """Extract text from a video file by extracting audio and processing it"""
    temp_audio_path = None
    
    try:
        print(f"Processing video file: {file_path}")
        
        # Create a temporary file for the extracted audio
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio_file:
            temp_audio_path = temp_audio_file.name
        
        # Extract audio from video using moviepy
        print("Extracting audio from video...")
        video = VideoFileClip(file_path)
        video.audio.write_audiofile(temp_audio_path, codec='pcm_s16le')
        video.close()
        
        # Check the duration of the extracted audio
        audio_duration = get_audio_duration(temp_audio_path)
        print(f"Extracted audio duration: {audio_duration:.2f} seconds")
        
        # Process the extracted audio
        print(f"Audio extracted to {temp_audio_path}, now processing...")
        
        # Process directly with appropriate API based on duration
        if not SARVAM_API_KEY:
            return {"text": "Cannot process audio: Sarvam AI API key not set. Please set SARVAM_API_KEY environment variable.", 
                    "method": "Error: Missing API Key"}
        
        # Prepare the API request with the correct header format
        headers = {
            'api-subscription-key': SARVAM_API_KEY.strip()
        }
        content_type = 'audio/wav'
        
        # Use appropriate API based on duration
        if audio_duration <= 30:
            audio_extraction_result = process_short_audio(temp_audio_path, content_type, headers)
        else:
            audio_extraction_result = process_long_audio(temp_audio_path, content_type, headers)
        
        # Add info that this was extracted from a video
        if "Error" not in audio_extraction_result["method"]:
            audio_extraction_result["method"] = f"Video Audio: {audio_extraction_result['method']}"
        
        return audio_extraction_result
    
    except Exception as e:
        error_message = f"Error extracting text from video: {str(e)}"
        print(error_message)
        import traceback
        traceback.print_exc()
        return {"text": error_message, "method": "Error: Video Processing"}
    
    finally:
        # Clean up temporary file if one was created
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.unlink(temp_audio_path)
                print(f"Cleaned up temporary file: {temp_audio_path}")
            except Exception as cleanup_error:
                print(f"Warning: Failed to delete temporary audio file: {cleanup_error}")

def extract_text(file_path, file_type):
    """Extract text based on file type"""
    if file_type == "Text":
        return extract_text_from_txt(file_path)
    elif file_type == "PDF":
        return extract_text_from_pdf(file_path)
    elif file_type == "Image":
        return extract_text_from_image(file_path)
    elif file_type == "Audio":
        return extract_text_from_audio(file_path)
    elif file_type == "Video":
        return extract_text_from_video(file_path)
    else:
        return {"text": f"Cannot extract text from unknown file type: {file_path}", "method": "Unknown"}

def save_extracted_text(file_path, extraction_result, file_type):
    """Save the extracted text to a file in the extracts folder"""
    # Get original filename without extension
    original_filename = os.path.basename(file_path)
    filename_without_ext = os.path.splitext(original_filename)[0]
    
    # Create a new filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_filename = f"{filename_without_ext}_{file_type}_{timestamp}.txt"
    
    # Full path to save
    save_path = os.path.join(EXTRACTS_DIR, new_filename)
    
    extracted_text = extraction_result["text"]
    extraction_method = extraction_result["method"]
    
    # Save the extracted text
    try:
        with open(save_path, 'w', encoding='utf-8') as f:
            f.write(f"Original file: {file_path}\n")
            f.write(f"File type: {file_type}\n")
            f.write(f"Extraction method: {extraction_method}\n")
            f.write(f"Extraction time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("-" * 50 + "\n\n")
            f.write(extracted_text)
        
        return save_path
    except Exception as e:
        print(f"Error saving extracted text: {e}")
        return None

def handle_file(file_path, text_display):
    """Handle the uploaded file and extract text"""
    file_name = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)
    file_type = detect_file_type(file_path)
    
    print(f"\nFile uploaded successfully!")
    print(f"File name: {file_name}")
    print(f"Detected file type: {file_type}")
    print(f"File size: {file_size} bytes")
    print(f"Upload time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Clear the text display
    text_display.delete(1.0, tk.END)
    
    # Add file info to display
    text_display.insert(tk.END, f"File: {file_name}\n")
    text_display.insert(tk.END, f"Type: {file_type}\n")
    text_display.insert(tk.END, f"Size: {file_size} bytes\n")
    text_display.insert(tk.END, f"Uploaded: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    
    # Extract and display text
    text_display.insert(tk.END, "Extracted Text:\n--------------\n")
    
    # Extract text based on file type
    extraction_result = extract_text(file_path, file_type)
    extracted_text = extraction_result["text"]
    extraction_method = extraction_result["method"]
    
    # Show extraction method
    text_display.insert(tk.END, f"Extraction method: {extraction_method}\n\n")
    
    # Show a preview in the console
    preview = extracted_text[:100] + "..." if len(extracted_text) > 100 else extracted_text
    print(f"Text preview: {preview}")
    print(f"Extraction method: {extraction_method}")
    
    # Display the extracted text
    text_display.insert(tk.END, extracted_text)
    
    # Save the extracted text
    saved_file_path = save_extracted_text(file_path, extraction_result, file_type)
    
    if saved_file_path:
        print(f"Extracted text saved to: {saved_file_path}")
        text_display.insert(tk.END, f"\n\nExtracted text saved to: {saved_file_path}")
    else:
        print("Failed to save extracted text")
        text_display.insert(tk.END, "\n\nFailed to save extracted text")

def upload_file(text_display):
    """Open file dialog to select a file and process it"""
    file_path = filedialog.askopenfilename(
        title="Select File",
        filetypes=[
            ("All Supported Files", "*.txt *.pdf *.jpg *.jpeg *.png *.gif *.mp3 *.wav *.ogg *.flac *.aac *.m4a *.mp4 *.avi *.mov *.mkv *.webm *.flv"),
            ("Text Files", "*.txt *.csv *.md *.json *.xml *.html"),
            ("PDF Files", "*.pdf"),
            ("Image Files", "*.jpg *.jpeg *.png *.gif *.bmp *.webp *.tiff"),
            ("Audio Files", "*.mp3 *.wav *.ogg *.flac *.aac *.m4a"),
            ("Video Files", "*.mp4 *.avi *.mov *.mkv *.webm *.flv"),
            ("All Files", "*.*")
        ]
    )
    
    if file_path:
        handle_file(file_path, text_display)
    else:
        print("No file selected.")

def create_gui():
    """Create the GUI for file upload"""
    root = tk.Tk()
    root.title("Multilingual Text Extractor")
    root.geometry("600x500")
    
    # Header
    header = tk.Label(root, text="Multilingual Text Extractor", font=("Arial", 18))
    header.pack(pady=20)
    
    # Description
    desc = tk.Label(root, text="Upload a file to extract text (supports various formats including Indic languages)")
    desc.pack(pady=5)
    
    # Folder info
    folder_info = tk.Label(root, text=f"Extracted files will be saved in: {os.path.abspath(EXTRACTS_DIR)}")
    folder_info.pack(pady=5)
    
    # Upload button
    upload_btn = tk.Button(
        root, 
        text="Upload File",
        command=lambda: upload_file(text_display),
        width=20,
        height=2,
        bg="#4CAF50",
        fg="white",
        font=("Arial", 12, "bold")
    )
    upload_btn.pack(pady=10)
    
    # Text display area
    frame = tk.Frame(root)
    frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
    
    text_display = scrolledtext.ScrolledText(
        frame, 
        wrap=tk.WORD, 
        width=60, 
        height=15,
        font=("Arial", 11)
    )
    text_display.pack(fill=tk.BOTH, expand=True)
    
    # Status bar
    status = tk.Label(root, text="Ready", bd=1, relief=tk.SUNKEN, anchor=tk.W)
    status.pack(side=tk.BOTTOM, fill=tk.X)
    
    root.mainloop()

def main():
    # Check for Tesseract installation
    try:
        pytesseract.get_tesseract_version()
        print("Tesseract OCR is installed.")
    except pytesseract.TesseractNotFoundError:
        print("Warning: Tesseract OCR is not installed. It will be used as fallback for image text extraction.")
        print("Please install Tesseract OCR: https://github.com/tesseract-ocr/tesseract")
    except Exception as e:
        print(f"Warning: Issue with Tesseract OCR: {e}")
    
    # Check for Tika
    try:
        tika_ver = tika.version.TIKA_VERSION
        print(f"Apache Tika is available (version connector: {tika_ver})")
    except:
        print("Warning: There might be issues with Apache Tika. Make sure Java is installed on your system.")
        print("Tika requires Java Runtime Environment (JRE) to function.")
    
    # Check for Sarvam AI API key
    if not SARVAM_API_KEY:
        print("\nWarning: Sarvam AI API key is not set. Audio and video extraction will not work.")
        print("Please set your SARVAM_API_KEY in the .env file or as an environment variable.")
        print("You can get an API key from https://studio.sarvam.ai/")
    else:
        print("\nSarvam AI API key is set. Audio and video extraction with translation is available.")
        api_key_preview = SARVAM_API_KEY[:4] + "..." if len(SARVAM_API_KEY) > 4 else "Invalid format"
        print(f"API Key (first 4 chars): {api_key_preview}")
        print(f"Real-time API URL: {SARVAM_SPEECH_TO_TEXT_TRANSLATE_URL}")
        print(f"Batch API URL: {SARVAM_BATCH_NOTEBOOK_URL}")
        print("Using Sarvam AI's speech-to-text-translate API with model 'saaras:v2'")
        print("Available models: saaras:v1, saaras:v2, saaras:turbo, saaras:flash")
    
    create_gui()

def get_audio_duration(file_path):
    """Get the duration of an audio file in seconds."""
    try:
        audio_clip = AudioFileClip(file_path)
        duration = audio_clip.duration
        audio_clip.close()
        return duration
    except Exception as e:
        print(f"Error determining audio duration: {str(e)}")
        # If we can't determine duration, assume it's longer than 30 seconds
        # to force batch processing (safer approach)
        return 31

if __name__ == "__main__":
    main()