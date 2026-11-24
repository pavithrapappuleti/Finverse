import requests

url = "http://127.0.0.1:5000/api/account/withdraw"

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4NjQ2MDM0MCwianRpIjoiNzU2Y2Q2MGMtMTViOC00MGNlLThlZTMtNjhmNjZjMGY5YzE0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3ODY0NjAzNDAsImNzcmYiOiJiZGUyYzAxMS0yYjZjLTRlZjktOTVlYi1jYjI5Y2JkYjc0YTMiLCJleHAiOjE3ODY0NjEyNDB9.4aWZRA6lMgcWBl-ijcN2tEe0bGD5CdoGVnOvOPmKaCw'
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

data = {
    "amount": 2000,
    "pin": "1234",
    "description": "Test withdrawal"
}

response = requests.post(
    url,
    headers=headers,
    json=data
)

print("Status Code:", response.status_code)
print("Response:")
print(response.json())