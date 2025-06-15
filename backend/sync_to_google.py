# def export_single_record(name, dob, age, image_data):
#     from datetime import datetime
#     import os
#     from googleapiclient.discovery import build
#     from googleapiclient.http import MediaFileUpload
#     from oauth2client.service_account import ServiceAccountCredentials
#     import gspread
#     import base64

#     SPREADSHEET_ID = "1uWEweylyFW1ukmrPMRhKOxBLwO6CxzoXt2aS4H0ucUM"
#     DRIVE_FOLDER_ID = "1-6XiV9ImD_SlLha0Rb-Xk5wbylbUqAQh"
#     scope = ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"]
#     creds = ServiceAccountCredentials.from_json_keyfile_name("facedata-462708-981ca5f2a971.json", scope)

#     # Setup
#     sheet = gspread.authorize(creds).open_by_key(SPREADSHEET_ID).sheet1
#     drive_service = build("drive", "v3", credentials=creds)

#     # Check for duplicate
#     existing_rows = sheet.get_all_records()
#     formatted_dob = dob.strftime("%Y-%m-%d")
#     key = (name, formatted_dob)
#     if key in [(r["Name"], r["DOB"]) for r in existing_rows]:
#         return  # Already exists

#     # Save temp image
#     temp_folder = "temp_export"
#     os.makedirs(temp_folder, exist_ok=True)
#     safe_name = name.replace(" ", "_").lower()
#     filename = f"{safe_name}_age_{age}_dob_{formatted_dob}.jpg"
#     local_path = os.path.join(temp_folder, filename)
#     with open(local_path, "wb") as f:
#         f.write(image_data)

#     # Upload to Drive
#     file_metadata = {"name": filename, "parents": [DRIVE_FOLDER_ID]}
#     media = MediaFileUpload(local_path, mimetype="image/jpeg")
#     uploaded_file = drive_service.files().create(body=file_metadata, media_body=media, fields="id").execute()
#     file_id = uploaded_file.get("id")
#     drive_link = f"https://drive.google.com/uc?id={file_id}"

#     # Append to Sheet
#     sheet.append_row([name, formatted_dob, age, drive_link])
#     os.remove(local_path)
def export_single_record(name, dob, age, image_data):
    import os
    import base64
    import json
    from datetime import datetime
    import gspread
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from google.oauth2 import service_account

    # Google API setup
    SPREADSHEET_ID = "1uWEweylyFW1ukmrPMRhKOxBLwO6CxzoXt2aS4H0ucUM"
    DRIVE_FOLDER_ID = "1-6XiV9ImD_SlLha0Rb-Xk5wbylbUqAQh"
    scope = ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"]

    # Decode base64 service account JSON
    creds_json = base64.b64decode(os.environ["GOOGLE_CREDS_B64"]).decode("utf-8")
    creds_dict = json.loads(creds_json)
    creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)

    # Authorize Sheets and Drive
    sheet = gspread.authorize(creds).open_by_key(SPREADSHEET_ID).sheet1
    drive_service = build("drive", "v3", credentials=creds)

    # Check for duplicate
    existing_rows = sheet.get_all_records()
    formatted_dob = dob.strftime("%Y-%m-%d")
    key = (name, formatted_dob)
    if key in [(r["Name"], r["DOB"]) for r in existing_rows]:
        return  # Skip if already exists

    # Save image temporarily
    temp_folder = "temp_export"
    os.makedirs(temp_folder, exist_ok=True)
    safe_name = name.replace(" ", "_").lower()
    filename = f"{safe_name}_age_{age}_dob_{formatted_dob}.jpg"
    local_path = os.path.join(temp_folder, filename)
    with open(local_path, "wb") as f:
        f.write(image_data)

    # Upload to Google Drive
    file_metadata = {"name": filename, "parents": [DRIVE_FOLDER_ID]}
    media = MediaFileUpload(local_path, mimetype="image/jpeg")
    uploaded_file = drive_service.files().create(body=file_metadata, media_body=media, fields="id").execute()
    file_id = uploaded_file.get("id")
    drive_link = f"https://drive.google.com/uc?id={file_id}"

    # Append record to Google Sheet
    sheet.append_row([name, formatted_dob, age, drive_link])
    os.remove(local_path)
