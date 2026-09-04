# -*- coding: utf-8 -*-
"""
Google Sheets Management Utility for Selena Spa
Uses Service Account to read and write directly to Google Sheets in real-time.
"""
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from google.oauth2 import service_account
from googleapiclient.discovery import build

KEY_PATH = r"C:\Users\Miles\Documents\chart-lott-v6\json\gen-lang-client-0937140639-fc6201dfedde.json"
SPREADSHEET_ID = "1SFFR2sWmOxtRIMOkdlkuKIDYyXJM7IxNyP9gFtZY0L0"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

def get_service():
    creds = service_account.Credentials.from_service_account_file(KEY_PATH, scopes=SCOPES)
    return build('sheets', 'v4', credentials=creds)

def read_range(range_str):
    service = get_service()
    res = service.spreadsheets().values().get(spreadsheetId=SPREADSHEET_ID, range=range_str).execute()
    return res.get('values', [])

def update_range(range_str, values):
    service = get_service()
    body = {'values': values}
    return service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=range_str,
        valueInputOption='USER_ENTERED',
        body=body
    ).execute()

def sync_config_to_firebase():
    """Reads tb_config and pushes live to Firebase Realtime Database in 0.03s"""
    import urllib.request, json
    rows = read_range('tb_config!A:B')
    cfg = {}
    ann = ''
    for r in rows[1:]:
        if len(r) > 0 and r[0].strip():
            k = r[0].strip().lower()
            v = r[1].strip() if len(r) > 1 else ''
            cfg[k] = v
            cfg[k.upper()] = v
            if k in ['announcement', 'thong_bao']:
                ann = v
    # 1. Push ui_config
    req = urllib.request.Request(
        'https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/config/ui_config.json',
        data=json.dumps(cfg).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    urllib.request.urlopen(req)
    # 2. Push announcement
    if ann:
        req2 = urllib.request.Request(
            'https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/config/announcement.json',
            data=json.dumps(ann).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        urllib.request.urlopen(req2)
    print("⚡ Synchronized config live to Firebase Realtime Database!")

def set_config(key, value):
    """Update or add a key-value in tb_config and auto sync to Firebase"""
    rows = read_range('tb_config!A:B')
    target_row = None
    for i, r in enumerate(rows):
        if len(r) > 0 and r[0].strip().lower() == key.strip().lower():
            target_row = i + 1
            break
    if target_row:
        res = update_range(f'tb_config!A{target_row}:B{target_row}', [[key, value]])
    else:
        new_row = len(rows) + 1
        res = update_range(f'tb_config!A{new_row}:B{new_row}', [[key, value]])
    sync_config_to_firebase()
    return res

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'set_config':
        k = sys.argv[2]
        v = sys.argv[3] if len(sys.argv) > 3 else ''
        res = set_config(k, v)
        print(f"Set config '{k}' = '{v}' successfully!")
    elif len(sys.argv) > 1 and sys.argv[1] == 'read_config':
        vals = read_range('tb_config!A:B')
        for r in vals:
            print(f"{r[0] if len(r)>0 else ''} = {r[1] if len(r)>1 else ''}")
    else:
        print("Usage: python sheet_tool.py [read_config | set_config <key> <value>]")
