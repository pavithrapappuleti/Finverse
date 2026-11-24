import requests


url = "http://127.0.0.1:5000/api/transfer"

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4NjQ2MDc1MiwianRpIjoiZTVkOTY3NTctMjQ0ZS00OTVkLTkxODMtNTM2Y2RjNTg2NmU4IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3ODY0NjA3NTIsImNzcmYiOiI4ZDgxY2NjNi1iMjRjLTRlY2UtOTkzYy1iZjUzZGRjM2M4OGYiLCJleHAiOjE3ODY0NjE2NTJ9.bFnxbQGsJPWgcsuqLXaxH_ihokI5S_BB5FIR8Ck1AUk'


headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}


data = {
    "recipient_account_id": 2,
    "amount": 1000,
    "pin": "1234",
    "description": "Test transfer"
}


response = requests.post(
    url,
    json=data,
    headers=headers
)


print("Status Code:", response.status_code)
print("Response:")
print(response.json())