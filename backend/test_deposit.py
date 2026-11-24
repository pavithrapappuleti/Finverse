import requests

url = "http://127.0.0.1:5000/api/account/deposit"

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4NjQ1OTI0MywianRpIjoiOTNmNzljOGMtZjIzNS00ODIwLThiOGItNjhkZTBmNDI0YzExIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3ODY0NTkyNDMsImNzcmYiOiJlZjBlNjQ2OS1jYTIxLTRiZTgtYjIwOS1mNTk1NTMyYjg2OGIiLCJleHAiOjE3ODY0NjAxNDN9.hA5hLowRA957iTqlBqNszWB4sp2V3ajpX11sKLja3ZU'
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

data = {
    "amount": 5000,
    "description": "Test deposit"
}

response = requests.post(
    url,
    headers=headers,
    json=data
)

print("Status Code:", response.status_code)
print("Response:")
print(response.json())