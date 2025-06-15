import os
import io
import pymysql
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import gspread

# --- Google API Setup ---
import base64
import json

# Get base64-encoded creds from environment
creds_json = base64.b64decode(os.environ['GOOGLE_CREDS_B64']).decode('utf-8')
creds_dict = json.loads(creds_json)

credentials = service_account.Credentials.from_service_account_info(
    creds_dict, scopes=SCOPES)

# --- Google Drive Setup ---
drive_service = build('drive', 'v3', credentials=credentials)

# Replace with your Drive folder ID
FOLDER_ID = '1-6XiV9ImD_SlLha0Rb-Xk5wbylbUqAQh'

# --- Google Sheets Setup ---
SPREADSHEET_ID = '1uWEweylyFW1ukmrPMRhKOxBLwO6CxzoXt2aS4H0ucUM'
gc = gspread.authorize(credentials)
sheet = gc.open_by_key(SPREADSHEET_ID).sheet1

# --- Get existing rows to avoid duplicates ---
existing_records = sheet.get_all_records()
existing_keys = set((row['Name'], row['DOB']) for row in existing_records)

# --- MySQL Database Connection ---
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='root',
    database='FaceDataDb',
    port=8889,
)
cursor = conn.cursor()

# Fetch records from database
cursor.execute("SELECT name, dob, age, image_data FROM faceData")
rows = cursor.fetchall()

for row in rows:
    name, dob, age, image_data = row
    if not image_data:
        continue

    dob_str = dob.strftime('%Y-%m-%d')
    if (name, dob_str) in existing_keys:
        print(f"⚠️ Already in Google Sheet: {name} - {dob_str}")
        continue

    # Prepare safe filename
    safe_name = name.strip().replace(" ", "_").lower()
    filename = f"{safe_name}_age_{age}_dob_{dob_str}.jpg"

    # Check if file already exists in Drive
    query = f"'{FOLDER_ID}' in parents and name = '{filename}' and trashed = false"
    response = drive_service.files().list(q=query, fields="files(id, name)").execute()
    if response['files']:
        print(f"⚠️ Already in Drive: {filename}")
        continue

    # Upload image to Drive
    file_metadata = {
        'name': filename,
        'parents': [FOLDER_ID]
    }
    media = MediaIoBaseUpload(io.BytesIO(image_data), mimetype='image/jpeg')
    uploaded_file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()

    file_id = uploaded_file.get('id')

    # Make the file public
    drive_service.permissions().create(
        fileId=file_id,
        body={'role': 'reader', 'type': 'anyone'},
    ).execute()

    # Get public link
    file_url = f"https://drive.google.com/uc?id={file_id}"

    # Add to Google Sheet
    sheet.append_row([name, dob_str, age, file_url])
    print(f"✅ Uploaded and logged: {filename}")

cursor.close()
conn.close()
print("✅ Export completed successfully.")
