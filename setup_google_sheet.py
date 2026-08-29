# -*- coding: utf-8 -*-
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

SERVICE_ACCOUNT_FILE = r'C:\Users\Miles\Documents\chart-lott-v6\json\gen-lang-client-0937140639-fc6201dfedde.json'
SPREADSHEET_ID = '1SFFR2sWmOxtRIMOkdlkuKIDYyXJM7IxNyP9gFtZY0L0'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

TABLES = {
    'tb_users': {
        'headers': ['user_id', 'phone', 'password', 'full_name', 'role', 'salary_type', 'base_salary'],
        'data': [
            ['FOUNDER_01', '0949251144', '123456', 'Miles (Chủ Sáng Lập)', 'admin', 'owner', 0],
            ['KTV01', '0912345678', '123456', 'KTV Mai Lan', 'staff', 'fixed_10pct', 2000000],
            ['KTV02', '0987654321', '123456', 'KTV Kim Hoa', 'staff', 'commission_20pct', 0]
        ]
    },
    'tb_menu': {
        'headers': ['service_id', 'service_name', 'price', 'duration_min', 'cosmetics_cost', 'commission_value'],
        'data': [
            ['CB_BE', 'Combo Bé (Gội cơ bản)', 45000, 30, 4500, 4500],
            ['CB_01', 'Combo 1 (Gội dưỡng sinh thư giãn)', 64000, 50, 6400, 6400],
            ['CB_02', 'Combo 2 (Dưỡng sinh chuyên sâu + Cổ vai gáy)', 109000, 75, 10000, 11000],
            ['CB_03', 'Combo 3 (Dưỡng sinh thảo mộc cao cấp)', 139000, 85, 14000, 14000],
            ['CB_04', 'Combo 4 (Liệu trình phục hồi da đầu + Massage)', 179000, 95, 18000, 18000],
            ['CB_05', 'Combo 5 (Đại tiệc Thư giãn Hoàng Gia)', 219000, 110, 22000, 22000]
        ]
    },
    'tb_customers': {
        'headers': ['phone_number', 'customer_name', 'total_visits', 'voucher_count', 'notes'],
        'data': [
            ['0912345678', 'Chị Mai Lan', 8, 0, 'Da đầu dầu nhạy cảm, thích sấy mát, gội nước ấm']
        ]
    },
    'tb_receipts': {
        'headers': ['receipt_id', 'date', 'customer_phone', 'customer_name', 'service_id', 'service_name', 'staff_id', 'staff_name', 'price', 'commission_amount', 'total_paid', 'payment_method', 'is_voucher_used'],
        'data': []
    },
    'tb_expenses': {
        'headers': ['expense_id', 'date', 'expense_type', 'amount', 'note'],
        'data': [
            ['EXP01', '2026-08-01', 'Mạng Internet', 350000, 'Gói wifi tiệm'],
            ['EXP02', '2026-08-01', 'Điện cố định', 1000000, 'Điện chiếu sáng & máy lạnh']
        ]
    },
    'tb_config': {
        'headers': ['config_key', 'config_value', 'description'],
        'data': [
            ['allowed_wifi_ip', '*', 'IP Wifi tiệm được phép đăng nhập (* = cho phép tất cả)'],
            ['bank_name', 'MBBank', 'Ngân hàng nhận chuyển khoản VietQR'],
            ['bank_account_no', '0912345678', 'Số tài khoản nhận tiền'],
            ['bank_account_name', 'SELENA SPA', 'Tên chủ tài khoản']
        ]
    }
}

def setup_sheets():
    creds = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('sheets', 'v4', credentials=creds)

    meta = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
    existing_sheets = {s['properties']['title']: s['properties']['sheetId'] for s in meta.get('sheets', [])}
    
    requests = []

    # 1. Create missing sheets
    for table_name in TABLES.keys():
        if table_name not in existing_sheets:
            requests.append({
                'addSheet': {
                    'properties': {
                        'title': table_name
                    }
                }
            })
    
    if requests:
        res = service.spreadsheets().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={'requests': requests}
        ).execute()
        for reply in res.get('replies', []):
            if 'addSheet' in reply:
                s_props = reply['addSheet']['properties']
                existing_sheets[s_props['title']] = s_props['sheetId']

    # 2. Write headers and seed data
    value_ranges = []
    for table_name, content in TABLES.items():
        all_rows = [content['headers']] + content['data']
        value_ranges.append({
            'range': f'\'{table_name}\'!A1',
            'values': all_rows
        })

    service.spreadsheets().values().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={
            'valueInputOption': 'USER_ENTERED',
            'data': value_ranges
        }
    ).execute()

    # 3. Format header styling (Purple header, white bold text, auto freeze 1st row)
    format_requests = []
    for table_name in TABLES.keys():
        sheet_id = existing_sheets[table_name]
        format_requests.extend([
            {
                'updateSheetProperties': {
                    'properties': {
                        'sheetId': sheet_id,
                        'gridProperties': {
                            'frozenRowCount': 1
                        }
                    },
                    'fields': 'gridProperties.frozenRowCount'
                }
            },
            {
                'repeatCell': {
                    'range': {
                        'sheetId': sheet_id,
                        'startRowIndex': 0,
                        'endRowIndex': 1
                    },
                    'cell': {
                        'userEnteredFormat': {
                            'backgroundColor': {
                                'red': 0.38,
                                'green': 0.18,
                                'blue': 0.65
                            },
                            'textFormat': {
                                'bold': True,
                                'foregroundColor': {
                                    'red': 1.0,
                                    'green': 1.0,
                                    'blue': 1.0
                                },
                                'fontSize': 10
                            },
                            'horizontalAlignment': 'CENTER'
                        }
                    },
                    'fields': 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                }
            }
        ])

    if format_requests:
        service.spreadsheets().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={'requests': format_requests}
        ).execute()

    print('SUCCESS: 6 Database tables created and styled successfully in Google Sheet!')

if __name__ == '__main__':
    setup_sheets()
